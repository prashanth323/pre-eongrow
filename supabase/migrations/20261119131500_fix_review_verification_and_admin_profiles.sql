-- Migration: Fix review_verification PL/pgSQL enum cast and add admin policy for profiles

CREATE OR REPLACE FUNCTION public.review_verification(
  _request_id uuid,
  _new_status verification_request_status,
  _review_notes text DEFAULT NULL::text,
  _rejection_reason text DEFAULT NULL::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

-- Ensure admin has full select permission on all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_admin'
  ) THEN
    CREATE POLICY profiles_select_admin ON public.profiles FOR SELECT TO authenticated USING (is_admin());
  END IF;
END $$;
