ALTER TABLE public.mf_entregas
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'app'
  CHECK (tipo IN ('app','propria'));