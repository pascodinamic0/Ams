-- Storage buckets for avatars, assignments, school-assets

-- Create avatars bucket (public for profile photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create assignments bucket (for assignment attachments and submissions)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'assignments',
  'assignments',
  false,
  10485760
)
ON CONFLICT (id) DO NOTHING;

-- Create school-assets bucket (for logos, cover images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'school-assets',
  'school-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for avatars: users can upload to their own folder
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS for assignments
CREATE POLICY "Authenticated users can upload assignments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignments'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can read assignments in their school"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignments'
    AND auth.role() = 'authenticated'
  );

-- Storage RLS for school-assets
CREATE POLICY "School admins can upload school assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'school-assets'
    AND auth.role() = 'authenticated'
    AND (
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
      OR (storage.foldername(name))[1] IN (SELECT school_id::text FROM profiles WHERE id = auth.uid() AND school_id IS NOT NULL)
    )
  );

CREATE POLICY "School assets are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'school-assets');
