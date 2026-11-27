-- Migration: Fix gen_random_bytes search path for issue_event_ticket and register_for_free_event

CREATE OR REPLACE FUNCTION public.issue_event_ticket(
  _registration_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
  _qr := encode(extensions.gen_random_bytes(32), 'hex');
  
  INSERT INTO public.event_tickets (
    registration_id, event_id, user_id, ticket_number, qr_token, status
  ) VALUES (
    _registration_id, _reg.event_id, _reg.user_id, _ticket_number, _qr, 'valid'
  ) RETURNING id INTO _ticket_id;
  
  RETURN _ticket_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_for_free_event(
  _event_id UUID,
  _ticket_category_id UUID,
  _attendee_name TEXT DEFAULT NULL,
  _attendee_email TEXT DEFAULT NULL,
  _attendee_phone TEXT DEFAULT NULL
)
RETURNS TABLE (
  registration_id UUID,
  ticket_id UUID,
  ticket_number TEXT,
  qr_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
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
  _qr := encode(extensions.gen_random_bytes(32), 'hex');  -- 64 char secure random token
  
  INSERT INTO public.event_tickets (
    registration_id, event_id, user_id, ticket_number, qr_token, status
  ) VALUES (
    _reg_id, _event_id, _user_id, _ticket_number, _qr, 'valid'
  ) RETURNING id INTO _ticket_id;
  
  RETURN QUERY SELECT _reg_id, _ticket_id, _ticket_number, _qr;
END;
$$;
