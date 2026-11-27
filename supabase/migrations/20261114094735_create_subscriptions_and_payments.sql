-- Subscriptions table: tracks each paid membership period
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_id UUID NOT NULL REFERENCES public.user_division_memberships(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
  status public.subscription_status NOT NULL DEFAULT 'payment_pending',
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  payment_id UUID,  -- FK added after payments table
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Payments table: generic, provider-agnostic
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purpose public.payment_purpose NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status public.payment_status NOT NULL DEFAULT 'pending',
  
  -- Provider fields (generic naming)
  provider TEXT NOT NULL DEFAULT 'razorpay',
  provider_order_id TEXT,    -- razorpay order_id
  provider_payment_id TEXT,  -- razorpay payment_id
  provider_signature TEXT,   -- razorpay signature for verification
  
  -- References to what was purchased
  reference_type TEXT,  -- 'subscription', 'event_registration', etc.
  reference_id UUID,    -- ID of the referenced entity
  
  -- Financial details
  tax_amount NUMERIC(10, 2) DEFAULT 0,
  discount_amount NUMERIC(10, 2) DEFAULT 0,
  net_amount NUMERIC(10, 2),  -- amount - discount + tax
  
  -- Metadata
  failure_reason TEXT,
  notes JSONB NOT NULL DEFAULT '{}',
  receipt_number TEXT,
  paid_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Add FK from subscriptions to payments
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_payment_id_fkey
  FOREIGN KEY (payment_id) REFERENCES public.payments(id);

-- Payment webhooks: idempotency and audit trail
CREATE TABLE public.payment_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'razorpay',
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,  -- provider's event ID for idempotency
  payload JSONB NOT NULL,
  processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider, event_id)  -- prevent duplicate webhook processing
);

-- Refunds table
CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  provider_refund_id TEXT,
  initiated_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_refunds_updated_at
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Enable RLS on all
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Subscriptions: users see their own
CREATE POLICY "subscriptions_select_own" ON public.subscriptions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "subscriptions_admin_select" ON public.subscriptions
  FOR SELECT USING (public.is_admin());

CREATE POLICY "subscriptions_admin_all" ON public.subscriptions
  FOR ALL USING (public.is_admin());

-- Payments: users see their own payments
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "payments_admin_select" ON public.payments
  FOR SELECT USING (public.is_admin());

-- Payment webhooks: only admins can view
CREATE POLICY "webhooks_admin_select" ON public.payment_webhooks
  FOR SELECT USING (public.is_admin());

-- Refunds: users see their own refunds
CREATE POLICY "refunds_select_own" ON public.refunds
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "refunds_admin_select" ON public.refunds
  FOR SELECT USING (public.is_admin());

-- Indexes
CREATE INDEX idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_membership ON public.subscriptions(membership_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_expires ON public.subscriptions(expires_at);
CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_provider_order ON public.payments(provider_order_id);
CREATE INDEX idx_payments_provider_payment ON public.payments(provider_payment_id);
CREATE INDEX idx_payments_reference ON public.payments(reference_type, reference_id);
CREATE INDEX idx_webhooks_event ON public.payment_webhooks(provider, event_id);
CREATE INDEX idx_refunds_payment ON public.refunds(payment_id);
CREATE INDEX idx_refunds_user ON public.refunds(user_id);
