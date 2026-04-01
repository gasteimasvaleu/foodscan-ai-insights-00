
CREATE TABLE public.user_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  objective_key text NOT NULL,
  target_value integer NOT NULL,
  target_unit text NOT NULL DEFAULT 'per_week',
  is_active boolean NOT NULL DEFAULT true,
  custom_keywords text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own objectives"
  ON public.user_objectives FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own objectives"
  ON public.user_objectives FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own objectives"
  ON public.user_objectives FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own objectives"
  ON public.user_objectives FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_user_objectives_updated_at
  BEFORE UPDATE ON public.user_objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
