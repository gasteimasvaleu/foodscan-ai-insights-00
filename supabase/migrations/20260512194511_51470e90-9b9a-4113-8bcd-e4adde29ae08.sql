-- Add new columns to baby_sleep
ALTER TABLE public.baby_sleep
  ADD COLUMN IF NOT EXISTS quality smallint,
  ADD COLUMN IF NOT EXISTS log_date date NOT NULL DEFAULT CURRENT_DATE;

-- Favorite baby names
CREATE TABLE IF NOT EXISTS public.baby_favorite_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  meaning text,
  origin text,
  gender text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.baby_favorite_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorite names" ON public.baby_favorite_names
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorite names" ON public.baby_favorite_names
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorite names" ON public.baby_favorite_names
  FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for baby generator
INSERT INTO storage.buckets (id, name, public)
VALUES ('baby-generator', 'baby-generator', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users view own baby-generator files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'baby-generator' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users upload own baby-generator files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'baby-generator' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own baby-generator files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'baby-generator' AND auth.uid()::text = (storage.foldername(name))[1]);