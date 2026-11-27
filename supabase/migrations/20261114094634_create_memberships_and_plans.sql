-- Membership plans (configurable per division)
CREATE TABLE public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'monthly', 'quarterly', 'annual', 'lifetime')),
  price_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  duration_days INTEGER,  -- NULL for lifetime
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,  -- default plan shown for this division
  max_members INTEGER,  -- NULL = unlimited
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(division_id, slug)
);

CREATE TRIGGER set_membership_plans_updated_at
  BEFORE UPDATE ON public.membership_plans
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- User division memberships (the junction between user and division)
CREATE TABLE public.user_division_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  membership_plan_id UUID REFERENCES public.membership_plans(id),
  status public.membership_status NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMPTZ,
  division_profile JSONB NOT NULL DEFAULT '{}',  -- division-specific profile data
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, division_id)
);

CREATE TRIGGER set_user_division_memberships_updated_at
  BEFORE UPDATE ON public.user_division_memberships
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Enable RLS
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_division_memberships ENABLE ROW LEVEL SECURITY;

-- Membership plans: anyone can read active plans
CREATE POLICY "plans_select_active" ON public.membership_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "plans_admin_insert" ON public.membership_plans
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "plans_admin_update" ON public.membership_plans
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "plans_admin_delete" ON public.membership_plans
  FOR DELETE USING (public.is_super_admin());

-- Division memberships: users can read their own
CREATE POLICY "memberships_select_own" ON public.user_division_memberships
  FOR SELECT USING (user_id = auth.uid());

-- Users can join divisions (insert)
CREATE POLICY "memberships_insert_own" ON public.user_division_memberships
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own division profile
CREATE POLICY "memberships_update_own" ON public.user_division_memberships
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can read all memberships
CREATE POLICY "memberships_admin_select" ON public.user_division_memberships
  FOR SELECT USING (public.is_admin());

-- Admins can update memberships (approve, suspend, etc.)
CREATE POLICY "memberships_admin_update" ON public.user_division_memberships
  FOR UPDATE USING (public.is_admin());

-- Indexes
CREATE INDEX idx_membership_plans_division ON public.membership_plans(division_id);
CREATE INDEX idx_membership_plans_type ON public.membership_plans(plan_type);
CREATE INDEX idx_udm_user ON public.user_division_memberships(user_id);
CREATE INDEX idx_udm_division ON public.user_division_memberships(division_id);
CREATE INDEX idx_udm_status ON public.user_division_memberships(status);
CREATE INDEX idx_udm_user_division ON public.user_division_memberships(user_id, division_id);

-- Seed free plans for Student Network and default free plans for other divisions
INSERT INTO public.membership_plans (division_id, name, slug, description, plan_type, price_amount, is_default, features, sort_order)
SELECT 
  d.id,
  CASE WHEN d.slug = 'student' THEN 'Student Free Membership' ELSE d.name || ' - Free Basic' END,
  'free-basic',
  CASE WHEN d.slug = 'student' THEN 'Full access to Student Network — always free' ELSE 'Basic free membership with limited features' END,
  'free',
  0,
  true,
  CASE WHEN d.slug = 'student' 
    THEN '["Full profile", "Event browsing", "Opportunity discovery", "Community access", "Networking"]'::jsonb
    ELSE '["Basic profile", "Event browsing", "Limited networking"]'::jsonb
  END,
  1
FROM public.divisions d;

-- Function to join a division (with business logic)
CREATE OR REPLACE FUNCTION public.join_division(
  _division_slug TEXT,
  _plan_slug TEXT DEFAULT 'free-basic',
  _division_profile JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _division_id UUID;
  _plan_id UUID;
  _plan_type TEXT;
  _membership_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get division
  SELECT id INTO _division_id
  FROM public.divisions
  WHERE slug = _division_slug AND is_active = true;
  
  IF _division_id IS NULL THEN
    RAISE EXCEPTION 'Division not found or inactive';
  END IF;
  
  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.user_division_memberships
    WHERE user_id = _user_id AND division_id = _division_id AND status != 'cancelled'
  ) THEN
    RAISE EXCEPTION 'Already a member of this division';
  END IF;
  
  -- Get plan
  SELECT id, plan_type INTO _plan_id, _plan_type
  FROM public.membership_plans
  WHERE division_id = _division_id AND slug = _plan_slug AND is_active = true;
  
  IF _plan_id IS NULL THEN
    RAISE EXCEPTION 'Membership plan not found or inactive';
  END IF;
  
  -- For paid plans, membership starts as pending_approval until payment is verified
  INSERT INTO public.user_division_memberships (user_id, division_id, membership_plan_id, status, division_profile)
  VALUES (
    _user_id,
    _division_id,
    _plan_id,
    CASE WHEN _plan_type = 'free' THEN 'active' ELSE 'pending_approval' END,
    _division_profile
  )
  RETURNING id INTO _membership_id;
  
  RETURN _membership_id;
END;
$$;
