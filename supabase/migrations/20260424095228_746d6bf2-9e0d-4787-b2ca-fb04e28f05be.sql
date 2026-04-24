-- Create public bucket for Virtual Try-On feature
INSERT INTO storage.buckets (id, name, public)
VALUES ('provador', 'provador', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access (bucket is public, needed for sharing/download)
CREATE POLICY "Provador images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'provador');

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload their own provador images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'provador'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own files
CREATE POLICY "Users can update their own provador images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'provador'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own files
CREATE POLICY "Users can delete their own provador images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'provador'
  AND auth.uid()::text = (storage.foldername(name))[1]
);