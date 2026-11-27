-- Create a payment order (called from Edge Function, not directly from client)
CREATE OR REPLACE FUNCTION public.create_payment_order(
  _user_id UUID,
  _purpose public.payment_purpose,
  _amount NUMERIC(10, 2),
  _reference_type TEXT,
  _reference_id UUID,
  _provider_order_id TEXT,
  _tax_amount NUMERIC(10, 2) DEFAULT 0,
  _discount_amount NUMERIC(10, 2) DEFAULT 0,
  _notes JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payment_id UUID;
  _net NUMERIC(10, 2);
BEGIN
  _net := _amount - COALESCE(_discount_amount, 0) + COALESCE(_tax_amount, 0);
  
  INSERT INTO public.payments (
    user_id, purpose, amount, status, provider_order_id,
    reference_type, reference_id, tax_amount, discount_amount, net_amount, notes
  ) VALUES (
    _user_id, _purpose, _amount, 'pending', _provider_order_id,
    _reference_type, _reference_id, _tax_amount, _discount_amount, _net, _notes
  )
  RETURNING id INTO _payment_id;
  
  -- Generate receipt number
  UPDATE public.payments
  SET receipt_number = 'NGF-' || to_char(now(), 'YYYYMMDD') || '-' || substring(_payment_id::text from 1 for 8)
  WHERE id = _payment_id;
  
  RETURN _payment_id;
END;
$$;

-- Activate a subscription after payment
CREATE OR REPLACE FUNCTION public.activate_subscription(
  _subscription_id UUID,
  _payment_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sub RECORD;
  _plan RECORD;
BEGIN
  SELECT * INTO _sub
  FROM public.subscriptions
  WHERE id = _subscription_id
  FOR UPDATE;
  
  IF _sub IS NULL THEN
    RAISE EXCEPTION 'Subscription not found';
  END IF;
  
  SELECT * INTO _plan
  FROM public.membership_plans
  WHERE id = _sub.plan_id;
  
  -- Update subscription
  UPDATE public.subscriptions
  SET status = 'active',
      payment_id = _payment_id,
      starts_at = now(),
      expires_at = CASE
        WHEN _plan.duration_days IS NOT NULL THEN now() + (_plan.duration_days || ' days')::interval
        ELSE NULL  -- lifetime
      END
  WHERE id = _subscription_id;
  
  -- Activate the division membership
  UPDATE public.user_division_memberships
  SET status = 'active',
      approved_at = now()
  WHERE id = _sub.membership_id;
  
  RETURN true;
END;
$$;

-- Expire overdue subscriptions (to be called by a cron or Edge Function)
CREATE OR REPLACE FUNCTION public.expire_overdue_subscriptions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER;
BEGIN
  WITH expired AS (
    UPDATE public.subscriptions
    SET status = 'expired'
    WHERE status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < now()
    RETURNING membership_id
  )
  UPDATE public.user_division_memberships
  SET status = 'expired'
  WHERE id IN (SELECT membership_id FROM expired)
    AND status = 'active'
    -- Only expire if no other active subscription exists
    AND NOT EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.membership_id = user_division_memberships.id
        AND s.status = 'active'
        AND (s.expires_at IS NULL OR s.expires_at > now())
    );
  
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

-- Create a subscription for a paid membership plan
CREATE OR REPLACE FUNCTION public.create_membership_subscription(
  _division_slug TEXT,
  _plan_slug TEXT
)
RETURNS TABLE(subscription_id UUID, membership_id UUID, plan_name TEXT, amount NUMERIC, currency TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _division RECORD;
  _plan RECORD;
  _membership_id UUID;
  _subscription_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get division
  SELECT * INTO _division
  FROM public.divisions
  WHERE slug = _division_slug AND is_active = true;
  
  IF _division IS NULL THEN
    RAISE EXCEPTION 'Division not found';
  END IF;
  
  -- Get plan
  SELECT * INTO _plan
  FROM public.membership_plans
  WHERE division_id = _division.id AND slug = _plan_slug AND is_active = true;
  
  IF _plan IS NULL THEN
    RAISE EXCEPTION 'Plan not found';
  END IF;
  
  IF _plan.plan_type = 'free' THEN
    RAISE EXCEPTION 'Use join_division for free plans';
  END IF;
  
  -- Upsert membership
  INSERT INTO public.user_division_memberships (user_id, division_id, membership_plan_id, status)
  VALUES (_user_id, _division.id, _plan.id, 'pending_approval')
  ON CONFLICT (user_id, division_id) DO UPDATE
    SET membership_plan_id = _plan.id, status = 'pending_approval'
  RETURNING id INTO _membership_id;
  
  -- Create subscription record (payment pending)
  INSERT INTO public.subscriptions (user_id, membership_id, plan_id, status)
  VALUES (_user_id, _membership_id, _plan.id, 'payment_pending')
  RETURNING id INTO _subscription_id;
  
  RETURN QUERY SELECT _subscription_id, _membership_id, _plan.name, _plan.price_amount, _plan.currency;
END;
$$;

-- Verify and complete a payment (initial version, updated later in event functions to handle registrations)
CREATE OR REPLACE FUNCTION public.complete_payment(
  _payment_id UUID,
  _provider_payment_id TEXT,
  _provider_signature TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _payment RECORD;
BEGIN
  SELECT * INTO _payment
  FROM public.payments
  WHERE id = _payment_id
  FOR UPDATE;
  
  IF _payment IS NULL THEN
    RAISE EXCEPTION 'Payment not found';
  END IF;
  
  IF _payment.status != 'pending' AND _payment.status != 'processing' THEN
    RAISE EXCEPTION 'Payment is not in a completable state: %', _payment.status;
  END IF;
  
  UPDATE public.payments
  SET status = 'completed',
      provider_payment_id = _provider_payment_id,
      provider_signature = _provider_signature,
      paid_at = now()
  WHERE id = _payment_id;
  
  IF _payment.reference_type = 'subscription' THEN
    PERFORM public.activate_subscription(_payment.reference_id, _payment_id);
  END IF;
  
  RETURN true;
END;
$$;
