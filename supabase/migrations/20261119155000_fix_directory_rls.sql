-- 20261119155000_fix_directory_rls.sql
-- Allow public and authenticated users to select active division memberships (needed for Member Directory)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_division_memberships' 
      AND policyname = 'memberships_select_active'
  ) THEN
    CREATE POLICY memberships_select_active ON public.user_division_memberships
      FOR SELECT TO public
      USING (status = 'active');
  END IF;
END $$;

-- Allow public and authenticated users to select skills for visible profiles
DROP POLICY IF EXISTS skills_select ON public.user_skills;
DROP POLICY IF EXISTS skills_select_public ON public.user_skills;

CREATE POLICY skills_select_public ON public.user_skills
  FOR SELECT TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_skills.user_id
        AND (p.visibility IN ('public', 'members_only') OR p.id = auth.uid())
    )
  );
