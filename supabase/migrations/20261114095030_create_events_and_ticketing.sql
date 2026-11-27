-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'workshop', 'networking_meetup', 'hackathon', 'conference', 'startup_summit',
    'business_exhibition', 'career_fair', 'creator_meetup', 'mentorship_session', 'annual_summit', 'other'
  )),
  status public.event_status NOT NULL DEFAULT 'draft',
  
  -- Scheduling
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  registration_opens_at TIMESTAMPTZ,
  registration_closes_at TIMESTAMPTZ,
  
  -- Venue
  venue_name TEXT,
  venue_address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  is_online BOOLEAN NOT NULL DEFAULT false,
  online_link TEXT,
  
  -- Capacity
  max_attendees INTEGER,
  current_attendees INTEGER NOT NULL DEFAULT 0,
  
  -- Media
  banner_url TEXT,
  thumbnail_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]',
  
  -- Organisation
  organiser_id UUID REFERENCES public.profiles(id),
  division_id UUID REFERENCES public.divisions(id),
  
  -- Pricing
  is_free BOOLEAN NOT NULL DEFAULT false,
  
  -- Eligibility
  eligibility_rules JSONB NOT NULL DEFAULT '{}',
  
  -- Schedule/Agenda
  agenda JSONB NOT NULL DEFAULT '[]',
  speakers JSONB NOT NULL DEFAULT '[]',
  sponsors JSONB NOT NULL DEFAULT '[]',
  
  -- Contact
  contact_email TEXT,
  contact_phone TEXT,
  
  -- SEO
  tags TEXT[] DEFAULT '{}',
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Event ticket categories (multiple tiers per event)
CREATE TABLE public.event_ticket_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  max_quantity INTEGER,  -- NULL = unlimited
  sold_count INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  
  -- Early bird pricing
  early_bird_price NUMERIC(10, 2),
  early_bird_ends_at TIMESTAMPTZ,
  
  -- Availability
  available_from TIMESTAMPTZ,
  available_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  sort_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_ticket_categories_updated_at
  BEFORE UPDATE ON public.event_ticket_categories
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_category_id UUID NOT NULL REFERENCES public.event_ticket_categories(id),
  status public.registration_status NOT NULL DEFAULT 'pending_payment',
  payment_id UUID REFERENCES public.payments(id),
  
  -- Registration details
  registration_number TEXT NOT NULL UNIQUE,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  
  -- Attendee info (can differ from profile)
  attendee_name TEXT,
  attendee_email TEXT,
  attendee_phone TEXT,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  refund_id UUID REFERENCES public.refunds(id),
  
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)  -- prevent duplicate registrations
);

CREATE TRIGGER set_event_registrations_updated_at
  BEFORE UPDATE ON public.event_registrations
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Event tickets (generated after successful registration/payment)
CREATE TABLE public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL UNIQUE REFERENCES public.event_registrations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Ticket identification
  ticket_number TEXT NOT NULL UNIQUE,
  qr_token TEXT NOT NULL UNIQUE,  -- secure random token for QR code
  
  status public.ticket_status NOT NULL DEFAULT 'valid',
  
  -- Check-in
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id),
  
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_event_tickets_updated_at
  BEFORE UPDATE ON public.event_tickets
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Event check-ins (audit log for all scan attempts)
CREATE TABLE public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.event_tickets(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  scanned_by UUID NOT NULL REFERENCES public.profiles(id),
  scan_result TEXT NOT NULL CHECK (scan_result IN ('success', 'already_used', 'invalid', 'cancelled', 'expired')),
  scan_location TEXT,
  device_info JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

-- Events: public read for published events
CREATE POLICY "events_select_published" ON public.events
  FOR SELECT USING (status IN ('published', 'registration_open', 'registration_closed', 'ongoing', 'completed'));

-- Admins/organisers can see all events
CREATE POLICY "events_select_admin" ON public.events
  FOR SELECT USING (
    public.is_admin()
    OR organiser_id = auth.uid()
    OR public.auth_has_role('event_organiser')
  );

-- Admins/organisers can create/update events
CREATE POLICY "events_insert_admin" ON public.events
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR public.auth_has_role('event_organiser')
  );

CREATE POLICY "events_update_admin" ON public.events
  FOR UPDATE USING (
    public.is_admin()
    OR organiser_id = auth.uid()
  );

-- Ticket categories: readable if event is visible
CREATE POLICY "ticket_cats_select" ON public.event_ticket_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_id
        AND e.status IN ('published', 'registration_open', 'registration_closed', 'ongoing', 'completed')
    )
    OR public.is_admin()
  );

CREATE POLICY "ticket_cats_admin" ON public.event_ticket_categories
  FOR ALL USING (public.is_admin() OR public.auth_has_role('event_organiser'));

-- Registrations: users see their own
CREATE POLICY "registrations_select_own" ON public.event_registrations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "registrations_admin_select" ON public.event_registrations
  FOR SELECT USING (
    public.is_admin()
    OR public.auth_has_role('event_organiser')
  );

-- Tickets: users see their own
CREATE POLICY "tickets_select_own" ON public.event_tickets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "tickets_admin_select" ON public.event_tickets
  FOR SELECT USING (
    public.is_admin()
    OR public.auth_has_role('event_organiser')
  );

-- Checkins: admin and organisers can see
CREATE POLICY "checkins_admin_select" ON public.event_checkins
  FOR SELECT USING (
    public.is_admin()
    OR public.auth_has_role('event_organiser')
  );

CREATE POLICY "checkins_insert" ON public.event_checkins
  FOR INSERT WITH CHECK (
    public.is_admin()
    OR public.auth_has_role('event_organiser')
  );

-- Indexes
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_starts ON public.events(starts_at);
CREATE INDEX idx_events_division ON public.events(division_id);
CREATE INDEX idx_events_organiser ON public.events(organiser_id);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_city ON public.events(city);
CREATE INDEX idx_ticket_cats_event ON public.event_ticket_categories(event_id);
CREATE INDEX idx_registrations_event ON public.event_registrations(event_id);
CREATE INDEX idx_registrations_user ON public.event_registrations(user_id);
CREATE INDEX idx_registrations_status ON public.event_registrations(status);
CREATE INDEX idx_tickets_event ON public.event_tickets(event_id);
CREATE INDEX idx_tickets_user ON public.event_tickets(user_id);
CREATE INDEX idx_tickets_qr ON public.event_tickets(qr_token);
CREATE INDEX idx_tickets_status ON public.event_tickets(status);
CREATE INDEX idx_checkins_ticket ON public.event_checkins(ticket_id);
CREATE INDEX idx_checkins_event ON public.event_checkins(event_id);
