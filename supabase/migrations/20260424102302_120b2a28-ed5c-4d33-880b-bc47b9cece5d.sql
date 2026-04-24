CREATE TABLE public.provador_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  result_url text NOT NULL,
  user_image_url text,
  outfit_image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_provador_generations_user_created
  ON public.provador_generations (user_id, created_at DESC);

ALTER TABLE public.provador_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own provador generations"
  ON public.provador_generations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provador generations"
  ON public.provador_generations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provador generations"
  ON public.provador_generations
  FOR DELETE
  USING (auth.uid() = user_id);