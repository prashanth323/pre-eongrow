-- 20261120113000_role_pricing_benefits_courses_affiliates.sql

-- 1. ADD COLUMNS TO MEMBERSHIP_PLANS & PROFILES
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'membership_plans' AND column_name = 'women_price_amount'
  ) THEN
    ALTER TABLE public.membership_plans ADD COLUMN women_price_amount numeric DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_women_discount_eligible'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_women_discount_eligible boolean DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  ALTER TYPE public.payment_purpose ADD VALUE IF NOT EXISTS 'course_certification';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. USER EVENT ENTITLEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_event_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_id uuid REFERENCES public.user_division_memberships(id) ON DELETE CASCADE,
  total_free_passes integer NOT NULL DEFAULT 3,
  used_free_passes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, membership_id)
);

-- 3. COURSES & CERTIFICATIONS
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  instructor text NOT NULL,
  thumbnail_url text,
  duration text NOT NULL DEFAULT '4 weeks',
  lessons_count integer NOT NULL DEFAULT 8,
  certification_fee numeric NOT NULL DEFAULT 999.00,
  is_published boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  curriculum jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress_pct integer NOT NULL DEFAULT 0,
  completed_lessons jsonb NOT NULL DEFAULT '[]'::jsonb,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  certification_status text NOT NULL DEFAULT 'none',
  certification_payment_id uuid REFERENCES public.payments(id),
  certificate_id text,
  certified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- 4. STUDENT AFFILIATE PROGRAM
CREATE TABLE IF NOT EXISTS public.affiliate_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_percentage numeric DEFAULT NULL, -- Left NULL until admin defines it!
  min_payout_amount numeric NOT NULL DEFAULT 500.00,
  is_active boolean NOT NULL DEFAULT true,
  updated_by uuid REFERENCES public.profiles(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.affiliate_settings (commission_percentage, min_payout_amount, is_active)
SELECT NULL, 500.00, true
WHERE NOT EXISTS (SELECT 1 FROM public.affiliate_settings);

CREATE TABLE IF NOT EXISTS public.affiliate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text UNIQUE NOT NULL,
  total_referrals integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  total_earnings numeric NOT NULL DEFAULT 0.00,
  pending_payout numeric NOT NULL DEFAULT 0.00,
  paid_payout numeric NOT NULL DEFAULT 0.00,
  payout_upi_id text,
  payout_bank_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_user_id uuid UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_code text NOT NULL,
  signup_at timestamptz NOT NULL DEFAULT now(),
  has_converted boolean NOT NULL DEFAULT false,
  first_payment_id uuid REFERENCES public.payments(id),
  first_subscription_role text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT no_self_referral CHECK (affiliate_user_id != referred_user_id)
);

CREATE TABLE IF NOT EXISTS public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referral_id uuid NOT NULL REFERENCES public.affiliate_referrals(id) ON DELETE CASCADE,
  payment_id uuid UNIQUE NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id),
  membership_role text,
  payment_amount numeric NOT NULL,
  commission_percentage numeric NOT NULL,
  commission_amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'approved',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payout_method text NOT NULL DEFAULT 'bank_transfer',
  transaction_reference text,
  notes text,
  processed_by uuid REFERENCES public.profiles(id),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
