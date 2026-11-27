-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('profile-images', 'profile-images', true, 5242880, -- 5MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('event-assets', 'event-assets', true, 10485760, -- 10MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
  ('documents', 'documents', false, 10485760, -- 10MB
   ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
  ('verification-documents', 'verification-documents', false, 10485760,
   ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('portfolios', 'portfolios', true, 20971520, -- 20MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'video/mp4'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for profile-images
CREATE POLICY "profile_images_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "profile_images_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for event-assets (admins and event organisers)
CREATE POLICY "event_assets_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-assets');

CREATE POLICY "event_assets_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'event-assets'
    AND auth.uid() IS NOT NULL
    AND (
      public.is_admin()
      OR public.auth_has_role('event_organiser')
    )
  );

CREATE POLICY "event_assets_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'event-assets'
    AND (
      public.is_admin()
      OR public.auth_has_role('event_organiser')
    )
  );

-- Storage policies for documents (private, user's own folder)
CREATE POLICY "documents_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY "documents_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "documents_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for verification-documents (private)
CREATE POLICY "verification_docs_select" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification-documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

CREATE POLICY "verification_docs_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for portfolios
CREATE POLICY "portfolios_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolios');

CREATE POLICY "portfolios_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolios'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "portfolios_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolios'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "portfolios_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolios'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
