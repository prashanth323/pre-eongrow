-- Search members across the platform
CREATE OR REPLACE FUNCTION public.search_members(
  _query TEXT DEFAULT NULL,
  _division_slug TEXT DEFAULT NULL,
  _city TEXT DEFAULT NULL,
  _skills TEXT[] DEFAULT NULL,
  _limit INTEGER DEFAULT 20,
  _offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  display_name TEXT,
  headline TEXT,
  avatar_url TEXT,
  city TEXT,
  verification_level public.verification_level,
  divisions TEXT[],
  top_skills TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT
    p.id AS user_id,
    p.full_name,
    p.display_name,
    p.headline,
    p.avatar_url,
    p.city,
    p.verification_level,
    ARRAY(
      SELECT d.slug FROM public.user_division_memberships udm
      JOIN public.divisions d ON d.id = udm.division_id
      WHERE udm.user_id = p.id AND udm.status = 'active'
    ) AS divisions,
    ARRAY(
      SELECT us.skill_name FROM public.user_skills us
      WHERE us.user_id = p.id
      ORDER BY us.is_primary DESC
      LIMIT 5
    ) AS top_skills
  FROM public.profiles p
  WHERE p.is_active = true
    AND p.visibility IN ('public', 'members_only')
    AND (
      _query IS NULL
      OR to_tsvector('english', coalesce(p.full_name, '') || ' ' || coalesce(p.headline, '') || ' ' || coalesce(p.bio, ''))
         @@ plainto_tsquery('english', _query)
    )
    AND (
      _division_slug IS NULL
      OR EXISTS (
        SELECT 1 FROM public.user_division_memberships udm
        JOIN public.divisions d ON d.id = udm.division_id
        WHERE udm.user_id = p.id AND d.slug = _division_slug AND udm.status = 'active'
      )
    )
    AND (
      _city IS NULL
      OR p.city ILIKE '%' || _city || '%'
    )
    AND (
      _skills IS NULL
      OR EXISTS (
        SELECT 1 FROM public.user_skills us
        WHERE us.user_id = p.id AND us.skill_name = ANY(_skills)
      )
    )
  ORDER BY p.verification_level DESC, p.full_name
  LIMIT _limit
  OFFSET _offset;
END;
$$;

-- Search opportunities
CREATE OR REPLACE FUNCTION public.search_opportunities(
  _query TEXT DEFAULT NULL,
  _type public.opportunity_type DEFAULT NULL,
  _city TEXT DEFAULT NULL,
  _is_remote BOOLEAN DEFAULT NULL,
  _skills TEXT[] DEFAULT NULL,
  _division_slug TEXT DEFAULT NULL,
  _limit INTEGER DEFAULT 20,
  _offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  opportunity_id UUID,
  title TEXT,
  slug TEXT,
  opportunity_type public.opportunity_type,
  company_name TEXT,
  city TEXT,
  is_remote BOOLEAN,
  compensation_type TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  application_deadline TIMESTAMPTZ,
  posted_by_name TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT
    o.id AS opportunity_id,
    o.title,
    o.slug,
    o.opportunity_type,
    cp.name AS company_name,
    o.city,
    o.is_remote,
    o.compensation_type,
    o.budget_min,
    o.budget_max,
    o.application_deadline,
    p.full_name AS posted_by_name,
    o.created_at
  FROM public.opportunities o
  LEFT JOIN public.company_profiles cp ON cp.id = o.company_id
  LEFT JOIN public.profiles p ON p.id = o.posted_by
  WHERE o.status = 'published'
    AND (o.application_deadline IS NULL OR o.application_deadline > now())
    AND (
      _query IS NULL
      OR to_tsvector('english', coalesce(o.title, '') || ' ' || coalesce(o.description, ''))
         @@ plainto_tsquery('english', _query)
    )
    AND (_type IS NULL OR o.opportunity_type = _type)
    AND (_city IS NULL OR o.city ILIKE '%' || _city || '%')
    AND (_is_remote IS NULL OR o.is_remote = _is_remote)
    AND (_skills IS NULL OR o.required_skills && _skills)
    AND (
      _division_slug IS NULL
      OR _division_slug = ANY(o.target_divisions)
      OR array_length(o.target_divisions, 1) IS NULL
    )
  ORDER BY o.is_featured DESC, o.created_at DESC
  LIMIT _limit
  OFFSET _offset;
END;
$$;

-- Send connection request
CREATE OR REPLACE FUNCTION public.send_connection_request(
  _receiver_id UUID,
  _message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _connection_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF _user_id = _receiver_id THEN RAISE EXCEPTION 'Cannot connect with yourself'; END IF;
  
  -- Check if connection already exists (in either direction)
  IF EXISTS (
    SELECT 1 FROM public.connections
    WHERE (requester_id = _user_id AND receiver_id = _receiver_id)
       OR (requester_id = _receiver_id AND receiver_id = _user_id)
  ) THEN
    RAISE EXCEPTION 'Connection already exists';
  END IF;
  
  INSERT INTO public.connections (requester_id, receiver_id, message, status)
  VALUES (_user_id, _receiver_id, _message, 'pending')
  RETURNING id INTO _connection_id;
  
  RETURN _connection_id;
END;
$$;

-- Respond to connection request
CREATE OR REPLACE FUNCTION public.respond_to_connection(
  _connection_id UUID,
  _accept BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  
  UPDATE public.connections
  SET status = CASE WHEN _accept THEN 'accepted'::public.connection_status ELSE 'rejected'::public.connection_status END,
      responded_at = now()
  WHERE id = _connection_id
    AND receiver_id = _user_id
    AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Connection request not found or already responded';
  END IF;
  
  RETURN true;
END;
$$;

-- Apply to opportunity
CREATE OR REPLACE FUNCTION public.apply_to_opportunity(
  _opportunity_id UUID,
  _cover_letter TEXT DEFAULT NULL,
  _resume_url TEXT DEFAULT NULL,
  _portfolio_url TEXT DEFAULT NULL,
  _additional_info JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID;
  _opp RECORD;
  _application_id UUID;
BEGIN
  _user_id := auth.uid();
  IF _user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  
  SELECT * INTO _opp FROM public.opportunities WHERE id = _opportunity_id;
  IF _opp IS NULL THEN RAISE EXCEPTION 'Opportunity not found'; END IF;
  IF _opp.status != 'published' THEN RAISE EXCEPTION 'Opportunity not accepting applications'; END IF;
  IF _opp.posted_by = _user_id THEN RAISE EXCEPTION 'Cannot apply to your own opportunity'; END IF;
  IF _opp.application_deadline IS NOT NULL AND now() > _opp.application_deadline THEN
    RAISE EXCEPTION 'Application deadline has passed';
  END IF;
  IF _opp.max_applications IS NOT NULL AND _opp.current_applications >= _opp.max_applications THEN
    RAISE EXCEPTION 'Maximum applications reached';
  END IF;
  
  INSERT INTO public.opportunity_applications (
    opportunity_id, applicant_id, cover_letter, resume_url, portfolio_url, additional_info
  ) VALUES (
    _opportunity_id, _user_id, _cover_letter, _resume_url, _portfolio_url, _additional_info
  )
  RETURNING id INTO _application_id;
  
  -- Update count
  UPDATE public.opportunities SET current_applications = current_applications + 1 WHERE id = _opportunity_id;
  
  RETURN _application_id;
END;
$$;
