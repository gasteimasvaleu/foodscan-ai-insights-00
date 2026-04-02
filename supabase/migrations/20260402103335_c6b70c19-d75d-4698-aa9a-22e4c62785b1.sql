
CREATE TABLE public.sleep_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  sleep_date date NOT NULL DEFAULT CURRENT_DATE,
  bedtime timestamptz NOT NULL,
  wake_time timestamptz NOT NULL,
  duration_minutes integer NOT NULL,
  quality_rating integer NOT NULL DEFAULT 3,
  tags text[] DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sleep records"
  ON public.sleep_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sleep records"
  ON public.sleep_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep records"
  ON public.sleep_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep records"
  ON public.sleep_records FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_sleep_records_user_date ON public.sleep_records (user_id, sleep_date DESC);
