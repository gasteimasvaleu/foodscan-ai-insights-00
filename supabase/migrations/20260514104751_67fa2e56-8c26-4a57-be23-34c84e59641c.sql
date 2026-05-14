
UPDATE storage.buckets SET public = true WHERE id = 'dm-media';

DROP POLICY IF EXISTS "DM media owner read" ON storage.objects;

CREATE POLICY "DM media public read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'dm-media');
