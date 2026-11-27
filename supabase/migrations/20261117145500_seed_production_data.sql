-- ====================================================================
-- NextGen Future Network - Production Seed Data Migration
-- Seeds users, profiles, roles, companies, events, ticket categories,
-- opportunities, division memberships, skills, and verification requests
-- ====================================================================

-- 1. SEED AUTH USERS
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES
  ('d0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@nextgenfuture.network', crypt('Admin@123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Vikramaditya Verma"}', now(), now()),
  ('d0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ananya.rao@apexventures.io', crypt('Founder@123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ananya Rao"}', now(), now()),
  ('d0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'aarav.sharma@campus.edu', crypt('Student@123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Aarav Sharma"}', now(), now()),
  ('d0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'devansh@designstudio.in', crypt('Devansh@123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Devansh Kapur"}', now(), now()),
  ('d0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'meera@zestorganics.in', crypt('Meera@123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Meera Deshmukh"}', now(), now()),
  ('d0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'priya@techcreator.in', crypt('Priya@123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Nair"}', now(), now()),
  ('d0000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'karan@singhaniaventures.com', crypt('Karan@123456', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Karan Singhania"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2. ENRICH PUBLIC PROFILES
UPDATE public.profiles SET
  display_name = 'Vikram',
  headline = 'Chief Community Officer & Super Admin @ NextGen Future',
  bio = 'Managing 7 network divisions, city chapters, and premier summit activations across India.',
  city = 'New Delhi',
  state = 'Delhi',
  avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  visibility = 'public',
  verification_level = 'special_credentials',
  onboarding_completed = true
WHERE id = 'd0000000-0000-0000-0000-000000000001';

UPDATE public.profiles SET
  display_name = 'Ananya',
  headline = 'Founder & CEO @ NeoFlow AI | Tech Entrepreneur',
  bio = 'Building autonomous workflow agents for Indian MSMEs. Looking for tech leads & angel co-investors.',
  city = 'Hyderabad',
  state = 'Telangana',
  avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  visibility = 'public',
  verification_level = 'business_verified',
  onboarding_completed = true
WHERE id = 'd0000000-0000-0000-0000-000000000002';

UPDATE public.profiles SET
  display_name = 'Aarav',
  headline = 'Computer Science Undergrad @ RVCE | Full-Stack & AI Enthusiast',
  bio = 'Passionate about distributed systems, micro-agents, and building student tech communities.',
  city = 'Bangalore',
  state = 'Karnataka',
  avatar_url = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  visibility = 'public',
  verification_level = 'contact_verified',
  onboarding_completed = true
WHERE id = 'd0000000-0000-0000-0000-000000000003';

UPDATE public.profiles SET
  display_name = 'Devansh',
  headline = 'Independent Design Director & Brand Strategist',
  bio = 'Crafting high-conversion SaaS web applications, design systems, and brand identities.',
  city = 'Delhi-NCR',
  state = 'Delhi',
  avatar_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  visibility = 'public',
  verification_level = 'professionally_verified',
  onboarding_completed = true
WHERE id = 'd0000000-0000-0000-0000-000000000004';

UPDATE public.profiles SET
  display_name = 'Meera',
  headline = 'Managing Director @ Zest Organics India | MSME Leader',
  bio = 'Scaling sustainable packaging and B2B industrial distribution across western India.',
  city = 'Pune',
  state = 'Maharashtra',
  avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
  visibility = 'public',
  verification_level = 'business_verified',
  onboarding_completed = true
WHERE id = 'd0000000-0000-0000-0000-000000000005';

UPDATE public.profiles SET
  display_name = 'Priya',
  headline = 'Tech & Startup Creator (450K+ Community)',
  bio = 'Covering the Indian startup ecosystem, AI breakthroughs, and founder journeys across YouTube and LinkedIn.',
  city = 'Mumbai',
  state = 'Maharashtra',
  avatar_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  visibility = 'public',
  verification_level = 'identity_verified',
  onboarding_completed = true
WHERE id = 'd0000000-0000-0000-0000-000000000006';

UPDATE public.profiles SET
  display_name = 'Karan',
  headline = 'Managing Partner @ Singhania Ventures | Angel Syndicate Lead',
  bio = 'Backing bold Indian founders across SaaS, FinTech, and DeepTech at Pre-Seed & Seed stages.',
  city = 'Mumbai',
  state = 'Maharashtra',
  avatar_url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  visibility = 'public',
  verification_level = 'special_credentials',
  onboarding_completed = true
WHERE id = 'd0000000-0000-0000-0000-000000000007';

-- 3. ASSIGN ROLES
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'super_admin'),
  ('d0000000-0000-0000-0000-000000000001', 'admin'),
  ('d0000000-0000-0000-0000-000000000001', 'event_organiser')
ON CONFLICT (user_id, role, division_id) DO NOTHING;

-- 4. DIVISION MEMBERSHIPS
-- Student
INSERT INTO public.user_division_memberships (user_id, division_id, status, joined_at)
SELECT 'd0000000-0000-0000-0000-000000000003', id, 'active', now() FROM public.divisions WHERE slug IN ('student', 'freelancer')
ON CONFLICT DO NOTHING;

-- Founder
INSERT INTO public.user_division_memberships (user_id, division_id, status, joined_at)
SELECT 'd0000000-0000-0000-0000-000000000002', id, 'active', now() FROM public.divisions WHERE slug IN ('entrepreneur', 'business', 'investor')
ON CONFLICT DO NOTHING;

-- Admin (all divisions)
INSERT INTO public.user_division_memberships (user_id, division_id, status, joined_at)
SELECT 'd0000000-0000-0000-0000-000000000001', id, 'active', now() FROM public.divisions
ON CONFLICT DO NOTHING;

-- Devansh (freelancer, career)
INSERT INTO public.user_division_memberships (user_id, division_id, status, joined_at)
SELECT 'd0000000-0000-0000-0000-000000000004', id, 'active', now() FROM public.divisions WHERE slug IN ('freelancer', 'career')
ON CONFLICT DO NOTHING;

-- Meera (business)
INSERT INTO public.user_division_memberships (user_id, division_id, status, joined_at)
SELECT 'd0000000-0000-0000-0000-000000000005', id, 'active', now() FROM public.divisions WHERE slug IN ('business')
ON CONFLICT DO NOTHING;

-- Priya (influencer, creator)
INSERT INTO public.user_division_memberships (user_id, division_id, status, joined_at)
SELECT 'd0000000-0000-0000-0000-000000000006', id, 'active', now() FROM public.divisions WHERE slug IN ('influencer', 'freelancer')
ON CONFLICT DO NOTHING;

-- Karan (investor)
INSERT INTO public.user_division_memberships (user_id, division_id, status, joined_at)
SELECT 'd0000000-0000-0000-0000-000000000007', id, 'active', now() FROM public.divisions WHERE slug IN ('investor', 'entrepreneur')
ON CONFLICT DO NOTHING;

-- 5. SKILLS
INSERT INTO public.user_skills (user_id, skill_name, is_primary) VALUES
  ('d0000000-0000-0000-0000-000000000003', 'React', true),
  ('d0000000-0000-0000-0000-000000000003', 'TypeScript', true),
  ('d0000000-0000-0000-0000-000000000003', 'Python', false),
  ('d0000000-0000-0000-0000-000000000003', 'Next.js', false),
  ('d0000000-0000-0000-0000-000000000002', 'Venture Building', true),
  ('d0000000-0000-0000-0000-000000000002', 'Autonomous Agents', true),
  ('d0000000-0000-0000-0000-000000000002', 'B2B SaaS', false),
  ('d0000000-0000-0000-0000-000000000004', 'Figma', true),
  ('d0000000-0000-0000-0000-000000000004', 'Design Systems', true),
  ('d0000000-0000-0000-0000-000000000004', 'UI/UX', true),
  ('d0000000-0000-0000-0000-000000000005', 'B2B Manufacturing', true),
  ('d0000000-0000-0000-0000-000000000005', 'Supply Chain', true),
  ('d0000000-0000-0000-0000-000000000006', 'Content Strategy', true),
  ('d0000000-0000-0000-0000-000000000006', 'Brand Sponsorships', true),
  ('d0000000-0000-0000-0000-000000000007', 'Angel Syndicates', true),
  ('d0000000-0000-0000-0000-000000000007', 'Deal Sourcing', true)
ON CONFLICT DO NOTHING;

-- 6. COMPANY PROFILES
INSERT INTO public.company_profiles (
  id, owner_id, name, slug, description, industry, company_size, website, logo_url, city, state, is_verified
) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'NeoFlow AI', 'neoflow-ai', 'Building autonomous workflow agents for Indian MSMEs.', 'Artificial Intelligence', '11-50', 'https://neoflow.ai', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80', 'Hyderabad', 'Telangana', true),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000005', 'Zest Organics India', 'zest-organics', 'Sustainable B2B packaging and bio-degradable shipping logistics.', 'Manufacturing', '51-200', 'https://zestorganics.in', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=150&q=80', 'Pune', 'Maharashtra', true),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000004', 'Kapur Design Studio', 'kapur-design', 'High-end interface design and brand systems for tech innovators.', 'Design & Creative', '1-10', 'https://kapurdesign.in', 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=150&q=80', 'Delhi-NCR', 'Delhi', true)
ON CONFLICT (id) DO NOTHING;

-- 7. FLAGSHIP EVENTS & TICKETING TIERS
INSERT INTO public.events (
  id, title, slug, description, short_description, event_type, status,
  starts_at, ends_at, venue_name, venue_address, city, state,
  is_online, max_attendees, current_attendees, banner_url,
  division_id, is_free
) VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'NextGen India Tech & Startup Summit 2026',
    'nextgen-india-tech-summit-2026',
    'The premier national gathering uniting student innovators, unicorn founders, top angel syndicates, and corporate leaders. Tracks include AI Systems, Venture Building, and B2B Commerce.',
    'National flagship gathering of founders, students & investors in Bangalore.',
    'conference',
    'registration_open',
    '2026-12-10T09:30:00+05:30',
    '2026-12-11T18:00:00+05:30',
    'Nimhans Convention Centre, Hosur Rd',
    'Hosur Road, Lakkasandra, Bengaluru, Karnataka 560029',
    'Bangalore',
    'Karnataka',
    false,
    800,
    524,
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    'ccbc63b6-a791-4d03-8a0d-acdd4f550912', -- entrepreneur
    false
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'Future AI Hackathon: Autonomous Agents',
    'future-ai-hackathon-2026',
    '36-hour non-stop hybrid hackathon designed for engineering students and independent makers. Build practical LLM workflows and micro-agents. 5,00,000 INR prize pool.',
    '36-hour non-stop AI hackathon with 5 Lakh prize pool.',
    'hackathon',
    'registration_open',
    '2026-11-28T09:00:00+05:30',
    '2026-11-29T21:00:00+05:30',
    'T-Hub 2.0, Knowledge City',
    'Raidurg, Hyderabad, Telangana 500081',
    'Hyderabad',
    'Telangana',
    true,
    500,
    389,
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
    'b0b208c8-941c-47ff-9734-7ff7ef2beb31', -- student
    true
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'B2B Trade & Vendor Alliance Meetup',
    'b2b-trade-vendor-alliance',
    'High-yield matchmaking for MSME owners, manufacturing units, logistics providers, and B2B distributors. Direct commercial introductions curated by chapter leads.',
    'Exclusive buyer-supplier and contract matchmaking for MSME owners.',
    'networking_meetup',
    'registration_open',
    '2026-12-05T17:00:00+05:30',
    '2026-12-05T21:00:00+05:30',
    'The Leela Mumbai, Andheri East',
    'Sahar Airport Road, Andheri East, Mumbai, Maharashtra 400059',
    'Mumbai',
    'Maharashtra',
    false,
    150,
    94,
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
    '11234052-c380-4cd4-9163-9a290b68f8a4', -- business
    false
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'Creator Economy & Brand Deals Masterclass',
    'creator-brand-deals-masterclass',
    'How content creators and freelancers can package their audience, draft air-tight sponsorship contracts, and close repeat five-figure brand collaborations.',
    'Monetize creative audience with verified brand partnership playbooks.',
    'workshop',
    'registration_open',
    '2026-11-22T15:00:00+05:30',
    '2026-11-22T18:00:00+05:30',
    'Interactive Virtual Studio',
    'Online Livestream',
    'Online',
    'Maharashtra',
    true,
    1000,
    672,
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'b3676713-f2d8-4221-b921-4e0e14306356', -- influencer
    true
  )
ON CONFLICT (id) DO NOTHING;

-- TICKET CATEGORIES
INSERT INTO public.event_ticket_categories (
  id, event_id, name, description, price_amount, currency, max_quantity, sold_count, is_free, sort_order
) VALUES
  ('ca000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Student Innovator Pass', '100% Free Concession pass for enrolled university students.', 0, 'INR', 200, 145, true, 1),
  ('ca000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Founder & Professional Pass', 'Full 2-day conference access, exhibition halls, and speed networking.', 1499, 'INR', 400, 312, false, 2),
  ('ca000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'VIP Investor & Speaker Lounge', 'Closed-door roundtable access, VIP networking dinner, and concierge intros.', 4999, 'INR', 100, 67, false, 3),
  ('ca000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000002', 'Free Student Team Entry', '36-hour hackathon participation, cloud credits, mentorship, and meals.', 0, 'INR', 500, 389, true, 1),
  ('ca000000-0000-0000-0000-000000000005', 'e0000000-0000-0000-0000-000000000003', 'Business Owner Delegate', 'Entry into matchmaking hall, vendor catalog, and networking dinner.', 999, 'INR', 150, 94, false, 1),
  ('ca000000-0000-0000-0000-000000000006', 'e0000000-0000-0000-0000-000000000004', 'Creator Free Access', 'Full workshop access, downloadable sponsorship contract templates.', 0, 'INR', 1000, 672, true, 1)
ON CONFLICT (id) DO NOTHING;

-- 8. OPPORTUNITIES
INSERT INTO public.opportunities (
  id, posted_by, company_id, division_id, title, slug, description,
  opportunity_type, status, is_remote, city, compensation_type,
  budget_min, budget_max, currency, required_skills, is_featured, created_at
) VALUES
  (
    '0b000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'b0b208c8-941c-47ff-9734-7ff7ef2beb31', -- student
    'Full-Stack Engineering Intern (React & Node)',
    'fullstack-intern-neoflow',
    'Work alongside senior architects to build AI workflow builders. We mentor fast learners and convert top performers to full-time roles.',
    'internship',
    'published',
    true,
    'Bangalore',
    'stipend',
    25000,
    35000,
    'INR',
    ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    true,
    now()
  ),
  (
    '0b000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'ccbc63b6-a791-4d03-8a0d-acdd4f550912', -- entrepreneur
    'Technical Co-Founder (Fintech / Lending Infrastructure)',
    'technical-cofounder-fintech',
    'Ex-McKinsey founder building MSME supply chain financing platform with 10 Cr committed LOIs. Seeking a hands-on CTO to lead architecture & compliance.',
    'cofounder_search',
    'published',
    false,
    'Mumbai',
    'equity',
    15,
    25,
    '% Equity',
    ARRAY['Distributed Systems', 'Go / Java', 'Fintech APIs', 'Cloud Architecture'],
    true,
    now()
  ),
  (
    '0b000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    'bd8e193d-b195-41f0-951f-a169c7d033bb', -- freelancer
    'Brand Identity & Design System Overhaul',
    'brand-identity-design-system',
    'Complete visual identity revamp including website components, pitch decks, customer portal UI kit, and brand guidelines for our series-A logistics firm.',
    'freelance_project',
    'published',
    true,
    'Delhi-NCR',
    'paid',
    80000,
    150000,
    'INR',
    ARRAY['Figma', 'Design Systems', 'Brand Strategy', 'UI/UX'],
    true,
    now()
  ),
  (
    '0b000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000005',
    'c0000000-0000-0000-0000-000000000002',
    '11234052-c380-4cd4-9163-9a290b68f8a4', -- business
    'Enterprise Packaging Material Suppliers (10k units/mo)',
    'packaging-supplier-requirement',
    'Looking for verified manufacturers and suppliers of eco-friendly corrugated boxes and biodegradable bubble wrap in Maharashtra/Gujarat region.',
    'business_requirement',
    'published',
    false,
    'Pune',
    'paid',
    300000,
    500000,
    'INR',
    ARRAY['Eco Packaging', 'B2B Manufacturing', 'Quality Compliance'],
    false,
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 9. EVENT REGISTRATION & ISSUED DIGITAL TICKET
-- Pre-generate valid ticket for Aarav Sharma
INSERT INTO public.event_registrations (
  id, event_id, user_id, ticket_category_id, registration_number,
  status, attendee_name, attendee_email, created_at
) VALUES (
  'ea000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000003',
  'ca000000-0000-0000-0000-000000000001',
  'REG-NGTS-8842',
  'confirmed',
  'Aarav Sharma',
  'aarav.sharma@campus.edu',
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.event_tickets (
  id, registration_id, event_id, user_id,
  ticket_number, qr_token, status, created_at
) VALUES (
  'fa000000-0000-0000-0000-000000000001',
  'ea000000-0000-0000-0000-000000000001',
  'e0000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000003',
  'TKT-NGTS-8842',
  'ngf_qr_9e4c19a07b4f2c918e77a2d10c558b3e94fa10b9c2847a',
  'valid',
  now()
) ON CONFLICT (id) DO NOTHING;

-- 10. VERIFICATION REQUESTS
INSERT INTO public.verification_requests (
  id, user_id, verification_type, status,
  notes, created_at
) VALUES (
  'ba000000-0000-0000-0000-000000000001',
  'd0000000-0000-0000-0000-000000000003',
  'identity_verified',
  'submitted',
  'College ID RVCE submitted for Student Network charter verification.',
  now()
), (
  'ba000000-0000-0000-0000-000000000002',
  'd0000000-0000-0000-0000-000000000002',
  'business_verified',
  'submitted',
  'MCA Certificate of Incorporation submitted for NeoFlow AI.',
  now()
) ON CONFLICT (id) DO NOTHING;
