
-- Create community-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-images', 'community-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload community images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'community-images');

-- Allow public read
CREATE POLICY "Anyone can view community images"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-images');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own community images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'community-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow anyone to view profiles for community (needed for author info)
CREATE POLICY "Anyone can view profiles for community"
ON public.profiles FOR SELECT
USING (true);
