
CREATE TABLE public.fasting_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  target_hours integer NOT NULL DEFAULT 16,
  protocol text NOT NULL DEFAULT '16:8',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fasting_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fasting records"
  ON public.fasting_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fasting records"
  ON public.fasting_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fasting records"
  ON public.fasting_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fasting records"
  ON public.fasting_records FOR DELETE
  USING (auth.uid() = user_id);
