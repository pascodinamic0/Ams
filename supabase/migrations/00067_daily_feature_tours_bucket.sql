-- Public bucket for daily feature tour videos and step screenshots (CI upload, email embed)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'daily-feature-tours',
  'daily-feature-tours',
  true,
  52428800,
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Service role uploads from GitHub Actions; public read for email embeds
CREATE POLICY "Daily feature tours are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'daily-feature-tours');

-- Writes use SUPABASE_SERVICE_ROLE_KEY from CI (bypasses RLS)
