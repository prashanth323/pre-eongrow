-- Divisions table: the 7 core divisions + extensible
CREATE TABLE public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color_hex TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_paid_membership BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE TRIGGER set_divisions_updated_at
  BEFORE UPDATE ON public.divisions
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Seed the 7 divisions
INSERT INTO public.divisions (slug, name, description, requires_paid_membership, sort_order) VALUES
  ('student', 'Student Network', 'Connect, learn and discover opportunities as a student. Free membership.', false, 1),
  ('career', 'Career & Professional Network', 'Advance your career through professional networking and opportunities.', false, 2),
  ('freelancer', 'Freelancer & Creator Network', 'Find projects, showcase your portfolio and connect with clients.', false, 3),
  ('entrepreneur', 'Entrepreneur & Startup Network', 'Build your startup, find co-founders, mentors and investors.', false, 4),
  ('business', 'Business Owners Network', 'Grow your business through strategic partnerships and opportunities.', false, 5),
  ('influencer', 'Influencers & Media Network', 'Collaborate on campaigns, grow your brand and connect with businesses.', false, 6),
  ('investor', 'Investors & Strategic Network', 'Discover investment opportunities and connect with founders.', false, 7);

-- Enable RLS
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

-- Anyone can read active divisions
CREATE POLICY "divisions_select_all" ON public.divisions
  FOR SELECT USING (is_active = true);

-- Only super_admin/admin can modify divisions (defined in role helper migration)
CREATE POLICY "divisions_admin_all" ON public.divisions
  FOR ALL USING (false) WITH CHECK (false);

-- Index
CREATE INDEX idx_divisions_slug ON public.divisions(slug);
CREATE INDEX idx_divisions_is_active ON public.divisions(is_active);
