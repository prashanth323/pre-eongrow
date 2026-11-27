-- ==============================================================================
-- Migration: Create waitlist_leads table for early access registration
-- Created for: Launch with no login / sign ups
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  division_interest TEXT NOT NULL DEFAULT 'student',
  organization TEXT,
  ticket_id TEXT,
  source_reason TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_email ON public.waitlist_leads(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_leads_created_at ON public.waitlist_leads(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public / anonymous visitors to insert their waitlist registration
DROP POLICY IF EXISTS "Allow public anonymous inserts into waitlist_leads" ON public.waitlist_leads;
CREATE POLICY "Allow public anonymous inserts into waitlist_leads"
  ON public.waitlist_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy 2: Allow service role and admins to read waitlist leads
DROP POLICY IF EXISTS "Allow service role and admins to view waitlist_leads" ON public.waitlist_leads;
CREATE POLICY "Allow service role and admins to view waitlist_leads"
  ON public.waitlist_leads
  FOR SELECT
  TO authenticated, service_role
  USING (true);
