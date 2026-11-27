-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "moddatetime";

-- Custom ENUM types
CREATE TYPE public.membership_status AS ENUM (
  'active', 'expired', 'suspended', 'cancelled', 'pending_approval'
);

CREATE TYPE public.subscription_status AS ENUM (
  'active', 'expired', 'cancelled', 'payment_pending', 'trial'
);

CREATE TYPE public.payment_status AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'
);

CREATE TYPE public.payment_purpose AS ENUM (
  'membership_subscription', 'event_ticket', 'service_purchase'
);

CREATE TYPE public.event_status AS ENUM (
  'draft', 'published', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled', 'postponed'
);

CREATE TYPE public.registration_status AS ENUM (
  'confirmed', 'pending_payment', 'cancelled', 'refunded', 'waitlisted'
);

CREATE TYPE public.ticket_status AS ENUM (
  'valid', 'used', 'cancelled', 'expired', 'refunded'
);

CREATE TYPE public.opportunity_type AS ENUM (
  'job', 'internship', 'freelance_project', 'business_requirement', 'buyer_supplier',
  'startup_opportunity', 'cofounder_search', 'creator_campaign', 'mentorship', 'collaboration'
);

CREATE TYPE public.opportunity_status AS ENUM (
  'draft', 'published', 'closed', 'filled', 'expired'
);

CREATE TYPE public.application_status AS ENUM (
  'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'
);

CREATE TYPE public.connection_status AS ENUM (
  'pending', 'accepted', 'rejected', 'blocked'
);

CREATE TYPE public.verification_level AS ENUM (
  'unverified', 'contact_verified', 'identity_verified', 'professionally_verified', 'business_verified', 'special_credentials'
);

CREATE TYPE public.verification_request_status AS ENUM (
  'submitted', 'under_review', 'approved', 'rejected', 'resubmission_required'
);

CREATE TYPE public.notification_channel AS ENUM (
  'in_app', 'email', 'sms', 'whatsapp', 'push'
);

CREATE TYPE public.admin_role AS ENUM (
  'super_admin', 'admin', 'chapter_manager', 'event_organiser', 'moderator', 'support_staff', 'member'
);

CREATE TYPE public.profile_visibility AS ENUM (
  'public', 'members_only', 'connections_only', 'private'
);
