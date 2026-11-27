-- Fix search_path on immutable/utility functions
CREATE OR REPLACE FUNCTION public.get_role_level(_role public.admin_role)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  RETURN CASE _role
    WHEN 'super_admin' THEN 100
    WHEN 'admin' THEN 90
    WHEN 'chapter_manager' THEN 70
    WHEN 'event_organiser' THEN 60
    WHEN 'moderator' THEN 50
    WHEN 'support_staff' THEN 40
    WHEN 'member' THEN 10
    ELSE 0
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_registration_number(_event_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
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

-- Revoke default public execution from all public routines
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- Revoke execute on all functions from PUBLIC and anon
DO $$
DECLARE
  func RECORD;
BEGIN
  FOR func IN
    SELECT proname, oidvectortypes(proargtypes) AS argtypes
    FROM pg_proc
    JOIN pg_namespace ON pg_namespace.oid = pg_proc.pronamespace
    WHERE pg_namespace.nspname = 'public'
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM PUBLIC, anon;', func.proname, func.argtypes);
  END LOOP;
END;
$$;

-- Grant EXECUTE to authenticated users for client-callable functions
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.admin_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.auth_has_role(public.admin_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_level(public.admin_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_max_role_level(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_role(UUID, public.admin_role, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_role(UUID, public.admin_role, UUID) TO authenticated;

GRANT EXECUTE ON FUNCTION public.join_division(TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_membership_subscription(TEXT, TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION public.register_for_free_event(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_for_paid_event(UUID, UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_event_ticket(TEXT) TO authenticated;

GRANT EXECUTE ON FUNCTION public.search_members(TEXT, TEXT, TEXT, TEXT[], INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_opportunities(TEXT, public.opportunity_type, TEXT, BOOLEAN, TEXT[], TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_connection_request(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_to_connection(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.apply_to_opportunity(UUID, TEXT, TEXT, TEXT, JSONB) TO authenticated;

GRANT EXECUTE ON FUNCTION public.submit_verification_request(public.verification_level, JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.review_verification(UUID, public.verification_request_status, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_notifications_read(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_notification_count() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(UUID, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_platform_stats() TO authenticated;

-- Service role has access to all functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
