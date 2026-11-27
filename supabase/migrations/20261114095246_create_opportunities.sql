-- Opportunities
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.company_profiles(id) ON DELETE SET NULL,
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  opportunity_type public.opportunity_type NOT NULL,
  status public.opportunity_status NOT NULL DEFAULT 'draft',
  
  -- Details
  location TEXT,
  is_remote BOOLEAN NOT NULL DEFAULT false,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  
  -- Compensation
  compensation_type TEXT CHECK (compensation_type IN ('paid', 'unpaid', 'equity', 'stipend', 'negotiable')),
  budget_min NUMERIC(12, 2),
  budget_max NUMERIC(12, 2),
  currency TEXT DEFAULT 'INR',
  
  -- Requirements
  required_skills TEXT[] DEFAULT '{}',
  experience_level TEXT CHECK (experience_level IN ('entry', 'intermediate', 'senior', 'expert', 'any')),
  education_requirement TEXT,
  
  -- Timeline
  application_deadline TIMESTAMPTZ,
  start_date DATE,
  end_date DATE,
  duration TEXT,
  
  -- Capacity
  max_applications INTEGER,
  current_applications INTEGER NOT NULL DEFAULT 0,
  positions_available INTEGER DEFAULT 1,
  
  -- Visibility
  is_featured BOOLEAN NOT NULL DEFAULT false,
  target_divisions TEXT[] DEFAULT '{}',
  
  tags TEXT[] DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Opportunity applications
CREATE TABLE public.opportunity_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES public.opportunities(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'submitted',
  
  -- Application content
  cover_letter TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  additional_info JSONB NOT NULL DEFAULT '{}',
  
  -- Response
  reviewer_id UUID REFERENCES public.profiles(id),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, applicant_id)
);

CREATE TRIGGER set_applications_updated_at
  BEFORE UPDATE ON public.opportunity_applications
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_applications ENABLE ROW LEVEL SECURITY;

-- Opportunities: published ones are readable by authenticated users
CREATE POLICY "opportunities_select_published" ON public.opportunities
  FOR SELECT USING (
    status = 'published'
    OR posted_by = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "opportunities_insert" ON public.opportunities
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND posted_by = auth.uid()
  );

CREATE POLICY "opportunities_update_own" ON public.opportunities
  FOR UPDATE USING (
    posted_by = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "opportunities_delete_own" ON public.opportunities
  FOR DELETE USING (
    posted_by = auth.uid()
    OR public.is_admin()
  );

-- Applications: applicants see their own, posters see applications to their opportunities
CREATE POLICY "applications_select_own" ON public.opportunity_applications
  FOR SELECT USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id AND o.posted_by = auth.uid()
    )
    OR public.is_admin()
  );

CREATE POLICY "applications_insert" ON public.opportunity_applications
  FOR INSERT WITH CHECK (
    applicant_id = auth.uid()
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "applications_update" ON public.opportunity_applications
  FOR UPDATE USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.opportunities o
      WHERE o.id = opportunity_id AND o.posted_by = auth.uid()
    )
    OR public.is_admin()
  );

-- Indexes
CREATE INDEX idx_opportunities_posted_by ON public.opportunities(posted_by);
CREATE INDEX idx_opportunities_type ON public.opportunities(opportunity_type);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_opportunities_division ON public.opportunities(division_id);
CREATE INDEX idx_opportunities_city ON public.opportunities(city);
CREATE INDEX idx_opportunities_deadline ON public.opportunities(application_deadline);
CREATE INDEX idx_opportunities_slug ON public.opportunities(slug);
CREATE INDEX idx_opportunities_skills ON public.opportunities USING gin(required_skills);
CREATE INDEX idx_opportunities_tags ON public.opportunities USING gin(tags);
CREATE INDEX idx_opportunities_search ON public.opportunities USING gin(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '')));
CREATE INDEX idx_applications_opportunity ON public.opportunity_applications(opportunity_id);
CREATE INDEX idx_applications_applicant ON public.opportunity_applications(applicant_id);
CREATE INDEX idx_applications_status ON public.opportunity_applications(status);
