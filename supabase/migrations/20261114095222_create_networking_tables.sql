-- User skills
CREATE TABLE public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  years_experience INTEGER,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_name)
);

-- User education
CREATE TABLE public.user_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_year INTEGER,
  end_year INTEGER,
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_user_education_updated_at
  BEFORE UPDATE ON public.user_education
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- User experience
CREATE TABLE public.user_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  employment_type TEXT CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'freelance', 'internship', 'self_employed')),
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_user_experience_updated_at
  BEFORE UPDATE ON public.user_experience
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- User social links
CREATE TABLE public.user_social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- User portfolio items
CREATE TABLE public.user_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  image_url TEXT,
  file_url TEXT,
  project_type TEXT,
  tags TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_user_portfolio_updated_at
  BEFORE UPDATE ON public.user_portfolio
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- User interests (for matching)
CREATE TABLE public.user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interest TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, interest)
);

-- Company/business profiles
CREATE TABLE public.company_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  founded_year INTEGER,
  website TEXT,
  logo_url TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  registration_number TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Connections
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.connection_status NOT NULL DEFAULT 'pending',
  message TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(requester_id, receiver_id),
  CHECK (requester_id != receiver_id)
);

CREATE TRIGGER set_connections_updated_at
  BEFORE UPDATE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Introduction requests (A asks B to introduce them to C)
CREATE TABLE public.introduction_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  introducer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed')),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (requester_id != introducer_id AND requester_id != target_id AND introducer_id != target_id)
);

CREATE TRIGGER set_introduction_requests_updated_at
  BEFORE UPDATE ON public.introduction_requests
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Member enquiries
CREATE TABLE public.member_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  replied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (sender_id != receiver_id)
);

-- Enable RLS
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.introduction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_enquiries ENABLE ROW LEVEL SECURITY;

-- Profile detail tables: visible to authenticated users (respecting parent profile visibility)
CREATE POLICY "skills_select" ON public.user_skills FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "skills_own" ON public.user_skills FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "education_select" ON public.user_education FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "education_own" ON public.user_education FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "experience_select" ON public.user_experience FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "experience_own" ON public.user_experience FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "social_links_select" ON public.user_social_links FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "social_links_own" ON public.user_social_links FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "portfolio_select" ON public.user_portfolio FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "portfolio_own" ON public.user_portfolio FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "interests_select" ON public.user_interests FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "interests_own" ON public.user_interests FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "company_select" ON public.company_profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "company_own" ON public.company_profiles FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "company_admin" ON public.company_profiles FOR ALL USING (public.is_admin());

-- Connections: both parties can see
CREATE POLICY "connections_select" ON public.connections
  FOR SELECT USING (requester_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "connections_insert" ON public.connections
  FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "connections_update" ON public.connections
  FOR UPDATE USING (receiver_id = auth.uid() OR requester_id = auth.uid());
CREATE POLICY "connections_delete" ON public.connections
  FOR DELETE USING (requester_id = auth.uid() OR receiver_id = auth.uid());

-- Introduction requests
CREATE POLICY "intros_select" ON public.introduction_requests
  FOR SELECT USING (requester_id = auth.uid() OR introducer_id = auth.uid() OR target_id = auth.uid());
CREATE POLICY "intros_insert" ON public.introduction_requests
  FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "intros_update" ON public.introduction_requests
  FOR UPDATE USING (introducer_id = auth.uid());

-- Enquiries
CREATE POLICY "enquiries_select" ON public.member_enquiries
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "enquiries_insert" ON public.member_enquiries
  FOR INSERT WITH CHECK (sender_id = auth.uid());
CREATE POLICY "enquiries_update" ON public.member_enquiries
  FOR UPDATE USING (receiver_id = auth.uid());

-- Indexes
CREATE INDEX idx_skills_user ON public.user_skills(user_id);
CREATE INDEX idx_skills_name ON public.user_skills(skill_name);
CREATE INDEX idx_education_user ON public.user_education(user_id);
CREATE INDEX idx_experience_user ON public.user_experience(user_id);
CREATE INDEX idx_social_user ON public.user_social_links(user_id);
CREATE INDEX idx_portfolio_user ON public.user_portfolio(user_id);
CREATE INDEX idx_interests_user ON public.user_interests(user_id);
CREATE INDEX idx_interests_interest ON public.user_interests(interest);
CREATE INDEX idx_company_owner ON public.company_profiles(owner_id);
CREATE INDEX idx_company_industry ON public.company_profiles(industry);
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX idx_connections_status ON public.connections(status);
CREATE INDEX idx_intros_requester ON public.introduction_requests(requester_id);
CREATE INDEX idx_intros_introducer ON public.introduction_requests(introducer_id);
CREATE INDEX idx_enquiries_receiver ON public.member_enquiries(receiver_id);
