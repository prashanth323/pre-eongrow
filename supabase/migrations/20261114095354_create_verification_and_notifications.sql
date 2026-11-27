-- Verification requests
CREATE TABLE public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  verification_type public.verification_level NOT NULL,
  status public.verification_request_status NOT NULL DEFAULT 'submitted',
  
  -- Submission details
  submitted_data JSONB NOT NULL DEFAULT '{}',
  notes TEXT,
  
  -- Review
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_verification_requests_updated_at
  BEFORE UPDATE ON public.verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Verification documents
CREATE TABLE public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.verification_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  notification_type TEXT NOT NULL,
  channel public.notification_channel NOT NULL DEFAULT 'in_app',
  
  -- Reference
  reference_type TEXT,
  reference_id UUID,
  
  -- State
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMPTZ,
  
  -- For external delivery
  delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  delivery_error TEXT,
  
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification preferences
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  channel public.notification_channel NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_type, channel)
);

CREATE TRIGGER set_notification_prefs_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Audit log for admin actions
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chapters (for chapter managers)
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'India',
  description TEXT,
  manager_id UUID REFERENCES public.profiles(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW
  EXECUTE FUNCTION moddatetime(updated_at);

-- Update user_roles to have proper FK to chapters
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_chapter_id_fkey
  FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Verification: users see their own, admins see all
CREATE POLICY "verification_select_own" ON public.verification_requests
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "verification_insert" ON public.verification_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "verification_update_admin" ON public.verification_requests
  FOR UPDATE USING (public.is_admin());

-- Verification docs: user own + admin
CREATE POLICY "verification_docs_select" ON public.verification_documents
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "verification_docs_insert" ON public.verification_documents
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications: users see their own only
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Notification preferences: own only
CREATE POLICY "notif_prefs_select_own" ON public.notification_preferences
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notif_prefs_all_own" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Audit log: admin only
CREATE POLICY "audit_admin_select" ON public.audit_log
  FOR SELECT USING (public.is_admin());

-- Chapters: readable by all authenticated, manageable by admins
CREATE POLICY "chapters_select" ON public.chapters
  FOR SELECT USING (is_active = true OR public.is_admin());
CREATE POLICY "chapters_admin" ON public.chapters
  FOR ALL USING (public.is_admin());

-- Indexes
CREATE INDEX idx_verification_user ON public.verification_requests(user_id);
CREATE INDEX idx_verification_status ON public.verification_requests(status);
CREATE INDEX idx_verification_type ON public.verification_requests(verification_type);
CREATE INDEX idx_verification_docs_request ON public.verification_documents(request_id);
CREATE INDEX idx_verification_docs_user ON public.verification_documents(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_type ON public.notifications(notification_type);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_notif_prefs_user ON public.notification_preferences(user_id);
CREATE INDEX idx_audit_actor ON public.audit_log(actor_id);
CREATE INDEX idx_audit_entity ON public.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_chapters_slug ON public.chapters(slug);
CREATE INDEX idx_chapters_manager ON public.chapters(manager_id);
