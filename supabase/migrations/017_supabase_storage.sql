-- Create Supabase Storage bucket for images
-- Run this in Supabase SQL Editor

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types, avif_autodetection)
VALUES (
  'gaskuy-images',
  'gaskuy-images',
  true,
  10485760,
  '{"image/jpeg","image/png","image/webp","image/avif"}',
  false
)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read objects
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'gaskuy-images');

-- Allow service_role full access
CREATE POLICY "Admin Full Access" ON storage.objects
  FOR ALL USING (
    bucket_id = 'gaskuy-images'
    AND auth.role() = 'authenticated'
  );
