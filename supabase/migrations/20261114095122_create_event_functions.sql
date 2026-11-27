-- Generate a unique registration number
CREATE OR REPLACE FUNCTION public.generate_registration_number(_event_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  _count INTEGER;
  _event_slug TEXT;
BEGIN
  SELECT slug INTO _event_slug FROM public.events WHERE id = _event_id;
  SELECT COUNT(*) + 1 INTO _count FROM public.event_registrations WHERE event_id = _event_id;
  RETURN upper(left(_event_slug, 6)) || '-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(_count::text, 4, '0');
END;
$$;

-- Register for a free event
CREATE OR REPLACE FUNCTION public.register_for_free_event(
  _event_id UUID,
  _ticket_category_id UUID,
  _attendee_name TEXT DEFAULT NULL,
  _attendee_email TEXT DEFAULT NULL,
  _attendee_phone TEXT DEFAULT NULL
)
RETURNS TABLE(registration_id UUID, ticket_id UUID, ticket_number TEXT, qr_token TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _event RECORD;
  _category RECORD;
  _reg_id UUID;
  _reg_number TEXT;
  _ticket_id UUID;
  _ticket_number TEXT;
  _qr TEXT;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Lock event row
  SELECT * INTO _event FROM public.events WHERE id = _event_id FOR UPDATE;
  IF _event IS NULL THEN RAISE EXCEPTION 'Event not found'; END IF;
  IF _event.status NOT IN ('published', 'registration_open') THEN
    RAISE EXCEPTION 'Event registration is not open';
  END IF;
  IF _event.registration_closes_at IS NOT NULL AND now() > _event.registration_closes_at THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;
  IF _event.max_attendees IS NOT NULL AND _event.current_attendees >= _event.max_attendees THEN
    RAISE EXCEPTION 'Event is full';
  END IF;
  
  -- Check duplicate
  IF EXISTS (SELECT 1 FROM public.event_registrations WHERE event_id = _event_id AND user_id = _user_id AND status NOT IN ('cancelled', 'refunded')) THEN
    RAISE EXCEPTION 'Already registered for this event';
  END IF;
  
  -- Lock ticket category
  SELECT * INTO _category FROM public.event_ticket_categories WHERE id = _ticket_category_id AND event_id = _event_id FOR UPDATE;
  IF _category IS NULL THEN RAISE EXCEPTION 'Ticket category not found'; END IF;
  IF NOT _category.is_free THEN RAISE EXCEPTION 'This category is not free. Use paid registration flow.'; END IF;
  IF NOT _category.is_active THEN RAISE EXCEPTION 'Ticket category not available'; END IF;
  IF _category.max_quantity IS NOT NULL AND _category.sold_count >= _category.max_quantity THEN
    RAISE EXCEPTION 'Tickets sold out for this category';
  END IF;
  
  -- Generate registration number
  _reg_number := public.generate_registration_number(_event_id);
  
  -- Create registration
  INSERT INTO public.event_registrations (
    event_id, user_id, ticket_category_id, status, registration_number,
    amount_paid, attendee_name, attendee_email, attendee_phone
  ) VALUES (
    _event_id, _user_id, _ticket_category_id, 'confirmed', _reg_number,
    0, _attendee_name, _attendee_email, _attendee_phone
  ) RETURNING id INTO _reg_id;
  
  -- Update counts
  UPDATE public.event_ticket_categories SET sold_count = sold_count + 1 WHERE id = _ticket_category_id;
  UPDATE public.events SET current_attendees = current_attendees + 1 WHERE id = _event_id;
  
  -- Generate ticket
  _ticket_number := 'TKT-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  _qr := encode(gen_random_bytes(32), 'hex');  -- 64 char secure random token
  
  INSERT INTO public.event_tickets (
    registration_id, event_id, user_id, ticket_number, qr_token, status
  ) VALUES (
    _reg_id, _event_id, _user_id, _ticket_number, _qr, 'valid'
  ) RETURNING id INTO _ticket_id;
  
  RETURN QUERY SELECT _reg_id, _ticket_id, _ticket_number, _qr;
END;
$$;

-- Create a paid event registration (generates registration, awaits payment)
CREATE OR REPLACE FUNCTION public.register_for_paid_event(
  _event_id UUID,
  _ticket_category_id UUID,
  _attendee_name TEXT DEFAULT NULL,
  _attendee_email TEXT DEFAULT NULL,
  _attendee_phone TEXT DEFAULT NULL
)
RETURNS TABLE(registration_id UUID, amount NUMERIC, currency TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _event RECORD;
  _category RECORD;
  _reg_id UUID;
  _reg_number TEXT;
  _price NUMERIC(10, 2);
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  
  SELECT * INTO _event FROM public.events WHERE id = _event_id FOR UPDATE;
  IF _event IS NULL THEN RAISE EXCEPTION 'Event not found'; END IF;
  IF _event.status NOT IN ('published', 'registration_open') THEN
    RAISE EXCEPTION 'Event registration is not open';
  END IF;
  IF _event.registration_closes_at IS NOT NULL AND now() > _event.registration_closes_at THEN
    RAISE EXCEPTION 'Registration deadline has passed';
  END IF;
  IF _event.max_attendees IS NOT NULL AND _event.current_attendees >= _event.max_attendees THEN
    RAISE EXCEPTION 'Event is full';
  END IF;
  
  IF EXISTS (SELECT 1 FROM public.event_registrations WHERE event_id = _event_id AND user_id = _user_id AND status NOT IN ('cancelled', 'refunded')) THEN
    RAISE EXCEPTION 'Already registered for this event';
  END IF;
  
  SELECT * INTO _category FROM public.event_ticket_categories WHERE id = _ticket_category_id AND event_id = _event_id FOR UPDATE;
  IF _category IS NULL THEN RAISE EXCEPTION 'Ticket category not found'; END IF;
  IF _category.is_free THEN RAISE EXCEPTION 'This is a free category. Use free registration.'; END IF;
  IF NOT _category.is_active THEN RAISE EXCEPTION 'Ticket category not available'; END IF;
  IF _category.max_quantity IS NOT NULL AND _category.sold_count >= _category.max_quantity THEN
    RAISE EXCEPTION 'Tickets sold out';
  END IF;
  
  -- Determine price (check early bird)
  IF _category.early_bird_price IS NOT NULL AND _category.early_bird_ends_at IS NOT NULL AND now() < _category.early_bird_ends_at THEN
    _price := _category.early_bird_price;
  ELSE
    _price := _category.price_amount;
  END IF;
  
  _reg_number := public.generate_registration_number(_event_id);
  
  INSERT INTO public.event_registrations (
    event_id, user_id, ticket_category_id, status, registration_number,
    amount_paid, attendee_name, attendee_email, attendee_phone
  ) VALUES (
    _event_id, _user_id, _ticket_category_id, 'pending_payment', _reg_number,
    _price, _attendee_name, _attendee_email, _attendee_phone
  ) RETURNING id INTO _reg_id;
  
  RETURN QUERY SELECT _reg_id, _price, _category.currency;
END;
$$;

-- Issue ticket after payment confirmed (called by complete_payment)
CREATE OR REPLACE FUNCTION public.issue_event_ticket(_registration_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reg RECORD;
  _ticket_id UUID;
  _ticket_number TEXT;
  _qr TEXT;
BEGIN
  SELECT * INTO _reg FROM public.event_registrations WHERE id = _registration_id FOR UPDATE;
  IF _reg IS NULL THEN RAISE EXCEPTION 'Registration not found'; END IF;
  
  -- Check if ticket already exists
  IF EXISTS (SELECT 1 FROM public.event_tickets WHERE registration_id = _registration_id) THEN
    SELECT id INTO _ticket_id FROM public.event_tickets WHERE registration_id = _registration_id;
    RETURN _ticket_id;
  END IF;
  
  -- Update registration status
  UPDATE public.event_registrations SET status = 'confirmed' WHERE id = _registration_id;
  
  -- Update counts
  UPDATE public.event_ticket_categories SET sold_count = sold_count + 1 WHERE id = _reg.ticket_category_id;
  UPDATE public.events SET current_attendees = current_attendees + 1 WHERE id = _reg.event_id;
  
  -- Generate ticket
  _ticket_number := 'TKT-' || upper(substring(gen_random_uuid()::text from 1 for 8));
  _qr := encode(gen_random_bytes(32), 'hex');
  
  INSERT INTO public.event_tickets (
    registration_id, event_id, user_id, ticket_number, qr_token, status
  ) VALUES (
    _registration_id, _reg.event_id, _reg.user_id, _ticket_number, _qr, 'valid'
  ) RETURNING id INTO _ticket_id;
  
  RETURN _ticket_id;
END;
$$;

-- Update the complete_payment function to handle event tickets
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
  
  IF _payment IS NULL THEN RAISE EXCEPTION 'Payment not found'; END IF;
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
  ELSIF _payment.reference_type = 'event_registration' THEN
    UPDATE public.event_registrations SET payment_id = _payment_id WHERE id = _payment.reference_id;
    PERFORM public.issue_event_ticket(_payment.reference_id);
  END IF;
  
  RETURN true;
END;
$$;

-- Validate a ticket (scan QR code) — concurrency-safe
CREATE OR REPLACE FUNCTION public.validate_event_ticket(_qr_token TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  scan_result TEXT,
  ticket_id UUID,
  ticket_number TEXT,
  event_title TEXT,
  attendee_name TEXT,
  ticket_status public.ticket_status,
  checked_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _ticket RECORD;
  _event RECORD;
  _reg RECORD;
  _scanner_id UUID;
  _result TEXT;
  _valid BOOLEAN;
BEGIN
  _scanner_id := auth.uid();
  IF _scanner_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  
  -- Verify scanner has permission
  IF NOT (public.is_admin() OR public.auth_has_role('event_organiser')) THEN
    RAISE EXCEPTION 'Unauthorized: only admins and event organisers can validate tickets';
  END IF;
  
  -- Lock the ticket row for update (prevents concurrent check-in race)
  SELECT * INTO _ticket FROM public.event_tickets WHERE qr_token = _qr_token FOR UPDATE;
  
  IF _ticket IS NULL THEN
    _result := 'invalid';
    _valid := false;
    
    RETURN QUERY SELECT _valid, _result, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::TEXT, NULL::public.ticket_status, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  
  SELECT * INTO _event FROM public.events WHERE id = _ticket.event_id;
  SELECT * INTO _reg FROM public.event_registrations WHERE id = _ticket.registration_id;
  
  IF _ticket.status = 'used' THEN
    _result := 'already_used';
    _valid := false;
  ELSIF _ticket.status = 'cancelled' OR _ticket.status = 'refunded' THEN
    _result := 'cancelled';
    _valid := false;
  ELSIF _ticket.status = 'expired' THEN
    _result := 'expired';
    _valid := false;
  ELSIF _ticket.status = 'valid' THEN
    UPDATE public.event_tickets
    SET status = 'used', checked_in_at = now(), checked_in_by = _scanner_id
    WHERE id = _ticket.id;
    
    _result := 'success';
    _valid := true;
  ELSE
    _result := 'invalid';
    _valid := false;
  END IF;
  
  -- Log the check-in attempt
  INSERT INTO public.event_checkins (ticket_id, event_id, scanned_by, scan_result)
  VALUES (_ticket.id, _ticket.event_id, _scanner_id, _result);
  
  RETURN QUERY SELECT
    _valid,
    _result,
    _ticket.id,
    _ticket.ticket_number,
    _event.title,
    COALESCE(_reg.attendee_name, (SELECT full_name FROM public.profiles WHERE id = _ticket.user_id)),
    _ticket.status,
    _ticket.checked_in_at;
END;
$$;
