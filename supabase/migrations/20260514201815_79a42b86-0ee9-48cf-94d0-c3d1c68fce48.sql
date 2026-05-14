-- Bucket de vídeos da comunidade
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-videos',
  'community-videos',
  true,
  52428800, -- 50 MB
  ARRAY['video/mp4','video/quicktime','video/webm']
)
ON CONFLICT (id) DO UPDATE
SET public = true,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS no bucket: leitura pública, escrita/exclusão só do dono (path = uid/...)
DROP POLICY IF EXISTS "community-videos public read" ON storage.objects;
CREATE POLICY "community-videos public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'community-videos');

DROP POLICY IF EXISTS "community-videos owner insert" ON storage.objects;
CREATE POLICY "community-videos owner insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'community-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "community-videos owner delete" ON storage.objects;
CREATE POLICY "community-videos owner delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'community-videos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Colunas de mídia em community_posts
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_storage_path text,
  ADD COLUMN IF NOT EXISTS video_poster_url text,
  ADD COLUMN IF NOT EXISTS video_duration_seconds numeric;

-- Colunas de mídia em community_stories
ALTER TABLE public.community_stories
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS video_url text,
  ADD COLUMN IF NOT EXISTS video_storage_path text,
  ADD COLUMN IF NOT EXISTS video_poster_url text,
  ADD COLUMN IF NOT EXISTS video_duration_seconds numeric;