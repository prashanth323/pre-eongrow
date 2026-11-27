-- Check if a user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.admin_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  );
END;
$$;

-- Check if current auth user has a specific role
CREATE OR REPLACE FUNCTION public.auth_has_role(_role public.admin_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.has_role(auth.uid(), _role);
END;
$$;

-- Check if user is any kind of admin (super_admin, admin)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role IN ('super_admin', 'admin')
      AND is_active = true
  );
END;
$$;

-- Check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.has_role(auth.uid(), 'super_admin');
END;
$$;

-- Check role level (numeric) for hierarchical checks
CREATE OR REPLACE FUNCTION public.get_role_level(_role public.admin_role)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
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

-- Get user's highest role level
CREATE OR REPLACE FUNCTION public.get_user_max_role_level(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_level INTEGER;
BEGIN
  SELECT COALESCE(MAX(public.get_role_level(role)), 0)
  INTO max_level
  FROM public.user_roles
  WHERE user_id = _user_id AND is_active = true;
  
  RETURN max_level;
END;
$$;

-- Secure role assignment: only higher-level admins can assign roles
-- And nobody can assign super_admin except existing super_admins
CREATE OR REPLACE FUNCTION public.assign_role(
  _target_user_id UUID,
  _role public.admin_role,
  _division_id UUID DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_level INTEGER;
  _target_level INTEGER;
  _new_role_level INTEGER;
  _role_id UUID;
BEGIN
  -- Get caller's max role level
  _caller_level := public.get_user_max_role_level(auth.uid());
  _target_level := public.get_user_max_role_level(_target_user_id);
  _new_role_level := public.get_role_level(_role);
  
  -- Cannot assign to self
  IF auth.uid() = _target_user_id THEN
    RAISE EXCEPTION 'Cannot assign roles to yourself';
  END IF;
  
  -- super_admin can only be assigned by super_admin
  IF _role = 'super_admin' AND NOT public.is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can assign super admin role';
  END IF;
  
  -- Caller must have higher level than the role being assigned
  IF _caller_level <= _new_role_level THEN
    RAISE EXCEPTION 'Insufficient permissions to assign this role';
  END IF;
  
  -- Cannot modify users with equal or higher level
  IF _target_level >= _caller_level THEN
    RAISE EXCEPTION 'Cannot modify roles for users at your level or above';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role, division_id, granted_by)
  VALUES (_target_user_id, _role, _division_id, auth.uid())
  ON CONFLICT (user_id, role, division_id) DO UPDATE
    SET is_active = true, granted_by = auth.uid(), granted_at = now()
  RETURNING id INTO _role_id;
  
  RETURN _role_id;
END;
$$;

-- Revoke a role (same hierarchy rules)
CREATE OR REPLACE FUNCTION public.revoke_role(
  _target_user_id UUID,
  _role public.admin_role,
  _division_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _caller_level INTEGER;
  _target_level INTEGER;
BEGIN
  _caller_level := public.get_user_max_role_level(auth.uid());
  _target_level := public.get_user_max_role_level(_target_user_id);
  
  IF auth.uid() = _target_user_id THEN
    RAISE EXCEPTION 'Cannot revoke your own roles';
  END IF;
  
  IF _target_level >= _caller_level THEN
    RAISE EXCEPTION 'Cannot modify roles for users at your level or above';
  END IF;
  
  UPDATE public.user_roles
  SET is_active = false
  WHERE user_id = _target_user_id
    AND role = _role
    AND (division_id = _division_id OR (_division_id IS NULL AND division_id IS NULL));
  
  RETURN FOUND;
END;
$$;

-- Now update divisions admin policy to use role check
DROP POLICY IF EXISTS "divisions_admin_all" ON public.divisions;

CREATE POLICY "divisions_admin_insert" ON public.divisions
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "divisions_admin_update" ON public.divisions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "divisions_admin_delete" ON public.divisions
  FOR DELETE USING (public.is_super_admin());
