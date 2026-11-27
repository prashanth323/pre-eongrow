-- Submit a verification request
CREATE OR REPLACE FUNCTION public.submit_verification_request(
  _verification_type public.verification_level,
  _data JSONB DEFAULT '{}',
  _notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _request_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  
  -- Check no pending request of same type
  IF EXISTS (
    SELECT 1 FROM public.verification_requests
    WHERE user_id = _user_id
      AND verification_type = _verification_type
      AND status IN ('submitted', 'under_review')
  ) THEN
    RAISE EXCEPTION 'A pending verification request of this type already exists';
  END IF;
  
  INSERT INTO public.verification_requests (user_id, verification_type, submitted_data, notes)
  VALUES (_user_id, _verification_type, _data, _notes)
  RETURNING id INTO _request_id;
  
  -- Create notification
  PERFORM public.create_notification(
    _user_id, 'Verification Request Submitted',
    'Your ' || _verification_type::text || ' verification request has been submitted for review.',
    'verification', 'verification_request', _request_id
  );
  
  RETURN _request_id;
END;
$$;

-- Review a verification request (admin only)
CREATE OR REPLACE FUNCTION public.review_verification(
  _request_id UUID,
  _new_status public.verification_request_status,
  _review_notes TEXT DEFAULT NULL,
  _rejection_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _reviewer_id UUID;
  _request RECORD;
BEGIN
  _reviewer_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  SELECT * INTO _request FROM public.verification_requests WHERE id = _request_id;
  IF _request IS NULL THEN RAISE EXCEPTION 'Request not found'; END IF;
  
  -- Update request
  UPDATE public.verification_requests
  SET status = _new_status,
      reviewed_by = _reviewer_id,
      reviewed_at = now(),
      review_notes = _review_notes,
      rejection_reason = _rejection_reason
  WHERE id = _request_id;
  
  -- If approved, update user's verification level
  IF _new_status = 'approved' THEN
    UPDATE public.profiles
    SET verification_level = _request.verification_type
    WHERE id = _request.user_id;
  END IF;
  
  -- Notify user
  PERFORM public.create_notification(
    _request.user_id,
    CASE _new_status
      WHEN 'approved' THEN 'Verification Approved'
      WHEN 'rejected' THEN 'Verification Rejected'
      WHEN 'resubmission_required' THEN 'Verification: Resubmission Required'
      ELSE 'Verification Update'
    END,
    CASE _new_status
      WHEN 'approved' THEN 'Your ' || _request.verification_type::text || ' verification has been approved.'
      WHEN 'rejected' THEN 'Your verification request was rejected. Reason: ' || COALESCE(_rejection_reason, 'Not specified')
      WHEN 'resubmission_required' THEN 'Please resubmit your verification documents. Notes: ' || COALESCE(_review_notes, 'See details')
      ELSE 'Your verification request status has been updated.'
    END,
    'verification', 'verification_request', _request_id
  );
  
  -- Audit log
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, new_values)
  VALUES (_reviewer_id, 'review_verification', 'verification_request', _request_id,
    jsonb_build_object('status', _new_status, 'review_notes', _review_notes));
  
  RETURN true;
END;
$$;

-- Create an in-app notification
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id UUID,
  _title TEXT,
  _body TEXT,
  _notification_type TEXT,
  _reference_type TEXT DEFAULT NULL,
  _reference_id UUID DEFAULT NULL,
  _channel public.notification_channel DEFAULT 'in_app'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notif_id UUID;
  _enabled BOOLEAN;
BEGIN
  -- Check user preferences (if they exist)
  SELECT enabled INTO _enabled
  FROM public.notification_preferences
  WHERE user_id = _user_id
    AND notification_type = _notification_type
    AND channel = _channel;
  
  -- Default to enabled if no preference set
  IF _enabled IS NOT NULL AND _enabled = false THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO public.notifications (
    user_id, title, body, notification_type, channel,
    reference_type, reference_id
  ) VALUES (
    _user_id, _title, _body, _notification_type, _channel,
    _reference_type, _reference_id
  )
  RETURNING id INTO _notif_id;
  
  RETURN _notif_id;
END;
$$;

-- Mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(_notification_ids UUID[])
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = true, read_at = now()
  WHERE id = ANY(_notification_ids)
    AND user_id = auth.uid()
    AND is_read = false;
  
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

-- Get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count INTEGER;
BEGIN
  SELECT COUNT(*) INTO _count
  FROM public.notifications
  WHERE user_id = auth.uid() AND is_read = false;
  
  RETURN _count;
END;
$$;

-- Admin: manage user (suspend, activate, etc.)
CREATE OR REPLACE FUNCTION public.admin_update_user(
  _target_user_id UUID,
  _is_active BOOLEAN DEFAULT NULL,
  _notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id UUID;
  _old_active BOOLEAN;
BEGIN
  _admin_id := auth.uid();
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Cannot modify users with equal or higher role
  IF public.get_user_max_role_level(_target_user_id) >= public.get_user_max_role_level(_admin_id) THEN
    RAISE EXCEPTION 'Cannot modify users at your level or above';
  END IF;
  
  SELECT is_active INTO _old_active FROM public.profiles WHERE id = _target_user_id;
  
  IF _is_active IS NOT NULL THEN
    UPDATE public.profiles SET is_active = _is_active WHERE id = _target_user_id;
  END IF;
  
  -- Audit
  INSERT INTO public.audit_log (actor_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (
    _admin_id, 
    CASE WHEN _is_active = false THEN 'suspend_user' ELSE 'update_user' END,
    'profile', _target_user_id,
    jsonb_build_object('is_active', _old_active),
    jsonb_build_object('is_active', _is_active, 'notes', _notes)
  );
  
  RETURN true;
END;
$$;

-- Admin: get platform statistics
CREATE OR REPLACE FUNCTION public.get_platform_stats()
RETURNS TABLE(
  total_users BIGINT,
  active_users BIGINT,
  total_events BIGINT,
  upcoming_events BIGINT,
  total_opportunities BIGINT,
  active_opportunities BIGINT,
  total_payments BIGINT,
  total_revenue NUMERIC,
  division_stats JSONB
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.profiles)::BIGINT,
    (SELECT count(*) FROM public.profiles WHERE is_active = true)::BIGINT,
    (SELECT count(*) FROM public.events)::BIGINT,
    (SELECT count(*) FROM public.events WHERE starts_at > now() AND status != 'cancelled')::BIGINT,
    (SELECT count(*) FROM public.opportunities)::BIGINT,
    (SELECT count(*) FROM public.opportunities WHERE status = 'published')::BIGINT,
    (SELECT count(*) FROM public.payments WHERE status = 'completed')::BIGINT,
    COALESCE((SELECT sum(net_amount) FROM public.payments WHERE status = 'completed'), 0),
    (
      SELECT jsonb_agg(jsonb_build_object(
        'division', d.name,
        'slug', d.slug,
        'member_count', COALESCE(mc.cnt, 0)
      ))
      FROM public.divisions d
      LEFT JOIN (
        SELECT division_id, count(*) AS cnt
        FROM public.user_division_memberships
        WHERE status = 'active'
        GROUP BY division_id
      ) mc ON mc.division_id = d.id
    );
END;
$$;
