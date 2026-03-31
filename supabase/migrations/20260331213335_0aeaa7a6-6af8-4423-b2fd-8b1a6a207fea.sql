CREATE TABLE IF NOT EXISTS public.hydration_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  beverage_key TEXT NOT NULL,
  beverage_name TEXT NOT NULL,
  volume_ml INTEGER NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  hydration_factor INTEGER NOT NULL,
  hydration_impact_ml NUMERIC NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumption_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.hydration_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'hydration_records' AND policyname = 'Users can view their own hydration records'
  ) THEN
    CREATE POLICY "Users can view their own hydration records"
    ON public.hydration_records
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'hydration_records' AND policyname = 'Users can create their own hydration records'
  ) THEN
    CREATE POLICY "Users can create their own hydration records"
    ON public.hydration_records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'hydration_records' AND policyname = 'Users can update their own hydration records'
  ) THEN
    CREATE POLICY "Users can update their own hydration records"
    ON public.hydration_records
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'hydration_records' AND policyname = 'Users can delete their own hydration records'
  ) THEN
    CREATE POLICY "Users can delete their own hydration records"
    ON public.hydration_records
    FOR DELETE
    USING (auth.uid() = user_id);
  END IF;
END $$;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hydration_goal_ml INTEGER NOT NULL DEFAULT 3000;

CREATE INDEX IF NOT EXISTS idx_hydration_records_user_date
ON public.hydration_records (user_id, consumption_date);

CREATE INDEX IF NOT EXISTS idx_hydration_records_user_consumed_at
ON public.hydration_records (user_id, consumed_at DESC);