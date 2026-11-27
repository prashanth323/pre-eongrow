-- 20261119161000_fix_auth_tokens_and_security_definer_roles.sql
-- 1. Fix GoTrue string column scan issue on auth.users (converting NULL to string is unsupported)
UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, '')
WHERE confirmation_token IS NULL 
   OR recovery_token IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change IS NULL;

-- 2. Make role helper functions SECURITY DEFINER with safe NULL checks and grant to anon, authenticated, service_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role admin_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
      AND is_active = true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  RETURN public.has_role(auth.uid(), 'super_admin');
END;
$function$;

CREATE OR REPLACE FUNCTION public.auth_has_role(_role admin_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  RETURN public.has_role(auth.uid(), _role);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_role_level(_role admin_role)
RETURNS integer
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $function$
BEGIN
  CASE _role
    WHEN 'super_admin' THEN RETURN 100;
    WHEN 'admin' THEN RETURN 80;
    WHEN 'chapter_manager' THEN RETURN 60;
    WHEN 'event_organiser' THEN RETURN 40;
    WHEN 'member' THEN RETURN 10;
    ELSE RETURN 0;
  END CASE;
END;
$function$;

-- Grant execute permissions so public RLS policies don't fail for anon / guests
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, admin_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.auth_has_role(admin_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_role_level(admin_role) TO anon, authenticated, service_role;

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
