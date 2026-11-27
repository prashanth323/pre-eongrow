-- Central user profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  display_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  avatar_url TEXT,
  bio TEXT,
  headline TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  website TEXT,
  linkedin_url TEXT,
  visibility public.profile_visibility NOT NULL DEFAULT 'members_only',
  verification_level public.verification_level NOT NULL DEFAULT 'unverified',
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_email_verified BOOLEAN NOT NULL DEFAULT false,
  is_phone_verified BOOLEAN NOT NULL DEFAULT false,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- User roles table (supports multiple roles per user)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.admin_role NOT NULL DEFAULT 'member',
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  chapter_id UUID,  -- will reference chapters table when created
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, role, division_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read public profiles, own profile
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (
    visibility = 'public'
    OR id = auth.uid()
  );

CREATE POLICY "profiles_select_members" ON public.profiles
  FOR SELECT USING (
    visibility IN ('public', 'members_only')
    AND auth.uid() IS NOT NULL
  );

-- Users can update only their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Users can insert their own profile (for new user trigger)
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- User roles: users can see their own roles
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_city ON public.profiles(city);
CREATE INDEX idx_profiles_visibility ON public.profiles(visibility);
CREATE INDEX idx_profiles_full_name ON public.profiles USING gin(to_tsvector('english', coalesce(full_name, '')));
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);

-- Handle new user trigger: automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  -- Assign default 'member' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
