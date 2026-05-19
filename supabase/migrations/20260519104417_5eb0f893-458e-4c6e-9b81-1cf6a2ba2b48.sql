
INSERT INTO storage.buckets (id, name, public) VALUES ('venue-photos', 'venue-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "venue-photos public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'venue-photos');

CREATE POLICY "venue-photos owner insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'venue-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "venue-photos owner update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'venue-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "venue-photos owner delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'venue-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
