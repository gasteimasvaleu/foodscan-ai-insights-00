ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS storage_path text;

ALTER TABLE public.venue_messages
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS storage_path text;

INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-chat-media', 'venue-chat-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "venue-chat-media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'venue-chat-media');

CREATE POLICY "venue-chat-media user upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'venue-chat-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "venue-chat-media user update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'venue-chat-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "venue-chat-media user delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'venue-chat-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );