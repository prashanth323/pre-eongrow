-- ==============================================================================
-- NextGen Future Network - Migration 18: Performance & Security Optimization
-- 1. Create covering indexes on unindexed foreign keys
-- 2. Move moddatetime extension to extensions schema
-- 3. Optimize RLS policies to use (select auth.uid()) for single evaluation per query
-- 4. Harden function execution permissions & switch safe functions to SECURITY INVOKER
-- ==============================================================================

-- 1. Covering indexes on foreign keys
CREATE INDEX IF NOT EXISTS idx_event_checkins_scanned_by ON public.event_checkins(scanned_by);
CREATE INDEX IF NOT EXISTS idx_event_registrations_payment_id ON public.event_registrations(payment_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_refund_id ON public.event_registrations(refund_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_ticket_cat ON public.event_registrations(ticket_category_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_checked_in_by ON public.event_tickets(checked_in_by);
CREATE INDEX IF NOT EXISTS idx_intro_requests_target ON public.introduction_requests(target_id);
CREATE INDEX IF NOT EXISTS idx_member_enquiries_sender ON public.member_enquiries(sender_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_company ON public.opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opp_applications_reviewer ON public.opportunity_applications(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment ON public.payment_webhooks(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_initiated_by ON public.refunds(initiated_by);
CREATE INDEX IF NOT EXISTS idx_subscriptions_payment ON public.subscriptions(payment_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_udm_approved_by ON public.user_division_memberships(approved_by);
CREATE INDEX IF NOT EXISTS idx_udm_plan_id ON public.user_division_memberships(membership_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_chapter ON public.user_roles(chapter_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_division ON public.user_roles(division_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_granted_by ON public.user_roles(granted_by);
CREATE INDEX IF NOT EXISTS idx_verification_requests_reviewed_by ON public.verification_requests(reviewed_by);

-- 2. Move extension moddatetime to extensions schema
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'moddatetime') THEN
    ALTER EXTENSION moddatetime SET SCHEMA extensions;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    NULL;
END $$;

-- 3. Optimize RLS policies to use (select auth.uid()) instead of auth.uid() directly
-- Profiles
DROP POLICY IF EXISTS profiles_select_public ON public.profiles;
CREATE POLICY profiles_select_public ON public.profiles
  FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS profiles_select_members ON public.profiles;
CREATE POLICY profiles_select_members ON public.profiles
  FOR SELECT TO authenticated
  USING (visibility IN ('public', 'members_only') OR id = (SELECT auth.uid()));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

-- User Roles
DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Memberships
DROP POLICY IF EXISTS memberships_select_own ON public.user_division_memberships;
CREATE POLICY memberships_select_own ON public.user_division_memberships
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS memberships_insert_own ON public.user_division_memberships;
CREATE POLICY memberships_insert_own ON public.user_division_memberships
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS memberships_update_own ON public.user_division_memberships;
CREATE POLICY memberships_update_own ON public.user_division_memberships
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Skills, Education, Experience, Portfolio, Social, Interests
DROP POLICY IF EXISTS skills_own ON public.user_skills;
CREATE POLICY skills_own ON public.user_skills
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS education_own ON public.user_education;
CREATE POLICY education_own ON public.user_education
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS experience_own ON public.user_experience;
CREATE POLICY experience_own ON public.user_experience
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS portfolio_own ON public.user_portfolio;
CREATE POLICY portfolio_own ON public.user_portfolio
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS social_links_own ON public.user_social_links;
CREATE POLICY social_links_own ON public.user_social_links
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS interests_own ON public.user_interests;
CREATE POLICY interests_own ON public.user_interests
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Subscriptions & Payments
DROP POLICY IF EXISTS subscriptions_select_own ON public.subscriptions;
CREATE POLICY subscriptions_select_own ON public.subscriptions
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS payments_select_own ON public.payments;
CREATE POLICY payments_select_own ON public.payments
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS refunds_select_own ON public.refunds;
CREATE POLICY refunds_select_own ON public.refunds
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Events, Registrations, Tickets
DROP POLICY IF EXISTS registrations_select_own ON public.event_registrations;
CREATE POLICY registrations_select_own ON public.event_registrations
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS tickets_select_own ON public.event_tickets;
CREATE POLICY tickets_select_own ON public.event_tickets
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Connections
DROP POLICY IF EXISTS connections_select ON public.connections;
CREATE POLICY connections_select ON public.connections
  FOR SELECT TO authenticated
  USING (requester_id = (SELECT auth.uid()) OR receiver_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS connections_insert ON public.connections;
CREATE POLICY connections_insert ON public.connections
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS connections_update ON public.connections;
CREATE POLICY connections_update ON public.connections
  FOR UPDATE TO authenticated
  USING (receiver_id = (SELECT auth.uid()) OR requester_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS connections_delete ON public.connections;
CREATE POLICY connections_delete ON public.connections
  FOR DELETE TO authenticated
  USING (requester_id = (SELECT auth.uid()) OR receiver_id = (SELECT auth.uid()));

-- Opportunities & Applications
DROP POLICY IF EXISTS opportunities_update_own ON public.opportunities;
CREATE POLICY opportunities_update_own ON public.opportunities
  FOR UPDATE TO authenticated
  USING (posted_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS opportunities_delete_own ON public.opportunities;
CREATE POLICY opportunities_delete_own ON public.opportunities
  FOR DELETE TO authenticated
  USING (posted_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS applications_select_own ON public.opportunity_applications;
CREATE POLICY applications_select_own ON public.opportunity_applications
  FOR SELECT TO authenticated
  USING (applicant_id = (SELECT auth.uid()) OR EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_applications.opportunity_id
      AND o.posted_by = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS applications_insert ON public.opportunity_applications;
CREATE POLICY applications_insert ON public.opportunity_applications
  FOR INSERT TO authenticated
  WITH CHECK (applicant_id = (SELECT auth.uid()));

-- Notifications
DROP POLICY IF EXISTS notifications_select_own ON public.notifications;
CREATE POLICY notifications_select_own ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS notif_prefs_select_own ON public.notification_preferences;
CREATE POLICY notif_prefs_select_own ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS notif_prefs_all_own ON public.notification_preferences;
CREATE POLICY notif_prefs_all_own ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Events admin policies
DROP POLICY IF EXISTS events_select_admin ON public.events;
CREATE POLICY events_select_admin ON public.events
  FOR SELECT TO authenticated
  USING ((SELECT is_admin()) OR organiser_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS events_update_admin ON public.events;
CREATE POLICY events_update_admin ON public.events
  FOR UPDATE TO authenticated
  USING ((SELECT is_admin()) OR organiser_id = (SELECT auth.uid()));

-- User networking tables SELECT public view
DROP POLICY IF EXISTS skills_select ON public.user_skills;
CREATE POLICY skills_select ON public.user_skills
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_skills.user_id
      AND (p.visibility IN ('public', 'members_only') OR p.id = (SELECT auth.uid()))
  ));

DROP POLICY IF EXISTS education_select ON public.user_education;
CREATE POLICY education_select ON public.user_education
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_education.user_id
      AND (p.visibility IN ('public', 'members_only') OR p.id = (SELECT auth.uid()))
  ));

DROP POLICY IF EXISTS experience_select ON public.user_experience;
CREATE POLICY experience_select ON public.user_experience
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_experience.user_id
      AND (p.visibility IN ('public', 'members_only') OR p.id = (SELECT auth.uid()))
  ));

DROP POLICY IF EXISTS social_links_select ON public.user_social_links;
CREATE POLICY social_links_select ON public.user_social_links
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_social_links.user_id
      AND (p.visibility IN ('public', 'members_only') OR p.id = (SELECT auth.uid()))
  ));

DROP POLICY IF EXISTS portfolio_select ON public.user_portfolio;
CREATE POLICY portfolio_select ON public.user_portfolio
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_portfolio.user_id
      AND (p.visibility IN ('public', 'members_only') OR p.id = (SELECT auth.uid()))
  ));

DROP POLICY IF EXISTS interests_select ON public.user_interests;
CREATE POLICY interests_select ON public.user_interests
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = user_interests.user_id
      AND (p.visibility IN ('public', 'members_only') OR p.id = (SELECT auth.uid()))
  ));

-- Company profiles
DROP POLICY IF EXISTS company_own ON public.company_profiles;
CREATE POLICY company_own ON public.company_profiles
  FOR ALL TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS company_select ON public.company_profiles;
CREATE POLICY company_select ON public.company_profiles
  FOR SELECT USING (is_verified = true OR owner_id = (SELECT auth.uid()));

-- Introduction requests
DROP POLICY IF EXISTS intros_insert ON public.introduction_requests;
CREATE POLICY intros_insert ON public.introduction_requests
  FOR INSERT TO authenticated
  WITH CHECK (requester_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS intros_select ON public.introduction_requests;
CREATE POLICY intros_select ON public.introduction_requests
  FOR SELECT TO authenticated
  USING (requester_id = (SELECT auth.uid()) OR introducer_id = (SELECT auth.uid()) OR target_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS intros_update ON public.introduction_requests;
CREATE POLICY intros_update ON public.introduction_requests
  FOR UPDATE TO authenticated
  USING (introducer_id = (SELECT auth.uid()) OR target_id = (SELECT auth.uid()));

-- Member enquiries
DROP POLICY IF EXISTS enquiries_insert ON public.member_enquiries;
CREATE POLICY enquiries_insert ON public.member_enquiries
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS enquiries_select ON public.member_enquiries;
CREATE POLICY enquiries_select ON public.member_enquiries
  FOR SELECT TO authenticated
  USING (sender_id = (SELECT auth.uid()) OR receiver_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS enquiries_update ON public.member_enquiries;
CREATE POLICY enquiries_update ON public.member_enquiries
  FOR UPDATE TO authenticated
  USING (receiver_id = (SELECT auth.uid()));

-- Opportunities
DROP POLICY IF EXISTS opportunities_insert ON public.opportunities;
CREATE POLICY opportunities_insert ON public.opportunities
  FOR INSERT TO authenticated
  WITH CHECK (posted_by = (SELECT auth.uid()));

DROP POLICY IF EXISTS opportunities_select_published ON public.opportunities;
CREATE POLICY opportunities_select_published ON public.opportunities
  FOR SELECT USING (status = 'published' OR posted_by = (SELECT auth.uid()));

-- Opportunity applications
DROP POLICY IF EXISTS applications_update ON public.opportunity_applications;
CREATE POLICY applications_update ON public.opportunity_applications
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.opportunities o
    WHERE o.id = opportunity_applications.opportunity_id
      AND o.posted_by = (SELECT auth.uid())
  ));

-- Verification requests & docs
DROP POLICY IF EXISTS verification_insert ON public.verification_requests;
CREATE POLICY verification_insert ON public.verification_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS verification_select_own ON public.verification_requests;
CREATE POLICY verification_select_own ON public.verification_requests
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS verification_docs_insert ON public.verification_documents;
CREATE POLICY verification_docs_insert ON public.verification_documents
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.verification_requests vr
    WHERE vr.id = verification_documents.request_id
      AND vr.user_id = (SELECT auth.uid())
  ));

DROP POLICY IF EXISTS verification_docs_select ON public.verification_documents;
CREATE POLICY verification_docs_select ON public.verification_documents
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.verification_requests vr
    WHERE vr.id = verification_documents.request_id
      AND vr.user_id = (SELECT auth.uid())
  ));

-- 4. Harden function execution permissions & switch safe functions to SECURITY INVOKER
REVOKE EXECUTE ON FUNCTION public.admin_update_user(uuid, boolean, text) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.assign_role(uuid, public.admin_role, uuid) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.revoke_role(uuid, public.admin_role, uuid) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text, uuid, public.notification_channel) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.review_verification(uuid, public.verification_request_status, text, text) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_max_role_level(uuid) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.validate_event_ticket(text) FROM authenticated, anon;

ALTER FUNCTION public.is_admin() SECURITY INVOKER;
ALTER FUNCTION public.is_super_admin() SECURITY INVOKER;
ALTER FUNCTION public.auth_has_role(public.admin_role) SECURITY INVOKER;
ALTER FUNCTION public.has_role(uuid, public.admin_role) SECURITY INVOKER;
ALTER FUNCTION public.get_unread_notification_count() SECURITY INVOKER;
ALTER FUNCTION public.search_members(text, text, text, text[], integer, integer) SECURITY INVOKER;
ALTER FUNCTION public.search_opportunities(text, public.opportunity_type, text, boolean, text[], text, integer, integer) SECURITY INVOKER;
ALTER FUNCTION public.mark_notifications_read(uuid[]) SECURITY INVOKER;
ALTER FUNCTION public.get_platform_stats() SECURITY INVOKER;
