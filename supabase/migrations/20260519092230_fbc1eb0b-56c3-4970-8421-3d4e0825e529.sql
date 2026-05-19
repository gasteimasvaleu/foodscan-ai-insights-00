
-- Tabela de posts gerados
CREATE TABLE public.generated_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_type text NOT NULL,
  theme text NOT NULL,
  tone text,
  audience text,
  caption text,
  hashtags text[] DEFAULT '{}',
  image_url text,
  cta text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select_generated_posts" ON public.generated_posts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert_generated_posts" ON public.generated_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_generated_posts" ON public.generated_posts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_delete_generated_posts" ON public.generated_posts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX idx_generated_posts_user_created ON public.generated_posts(user_id, created_at DESC);

CREATE TRIGGER trg_generated_posts_updated
  BEFORE UPDATE ON public.generated_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela de ideias semanais
CREATE TABLE public.post_ideas_weekly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  ideas jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, week_start)
);

ALTER TABLE public.post_ideas_weekly ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_select_post_ideas_weekly" ON public.post_ideas_weekly
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_insert_post_ideas_weekly" ON public.post_ideas_weekly
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_update_post_ideas_weekly" ON public.post_ideas_weekly
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own_delete_post_ideas_weekly" ON public.post_ideas_weekly
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bucket público para imagens geradas
INSERT INTO storage.buckets (id, name, public)
VALUES ('social-posts', 'social-posts', true)
ON CONFLICT (id) DO NOTHING;

-- Leitura pública
CREATE POLICY "social_posts_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'social-posts');

-- Dono pode upload/update/delete em sua pasta {user_id}/...
CREATE POLICY "social_posts_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'social-posts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "social_posts_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'social-posts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "social_posts_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'social-posts'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
