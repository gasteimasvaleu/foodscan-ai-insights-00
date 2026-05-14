
-- 1) Profile do desafiante
CREATE TABLE public.challenge_user_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gender TEXT CHECK (gender IN ('female','male','other')),
  age INTEGER CHECK (age >= 12 AND age <= 120),
  initial_weight NUMERIC(5,2) CHECK (initial_weight > 0 AND initial_weight < 500),
  body_photo_url TEXT,
  face_photo_url TEXT,
  motivation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.challenge_user_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cup select own" ON public.challenge_user_profile FOR SELECT USING (auth.uid() = id);
CREATE POLICY "cup insert own" ON public.challenge_user_profile FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "cup update own" ON public.challenge_user_profile FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "cup delete own" ON public.challenge_user_profile FOR DELETE USING (auth.uid() = id);
CREATE TRIGGER trg_cup_updated BEFORE UPDATE ON public.challenge_user_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Progresso
CREATE TABLE public.challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_day INTEGER NOT NULL DEFAULT 1,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp select own" ON public.challenge_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cp insert own" ON public.challenge_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cp update own" ON public.challenge_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cp delete own" ON public.challenge_progress FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_cp_updated BEFORE UPDATE ON public.challenge_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Checklist diário
CREATE TABLE public.challenge_daily_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 14),
  followed_menu BOOLEAN NOT NULL DEFAULT false,
  drank_water BOOLEAN NOT NULL DEFAULT false,
  walked BOOLEAN NOT NULL DEFAULT false,
  slept_well BOOLEAN NOT NULL DEFAULT false,
  mood TEXT,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);
ALTER TABLE public.challenge_daily_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cdc select own" ON public.challenge_daily_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cdc insert own" ON public.challenge_daily_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cdc update own" ON public.challenge_daily_checklist FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cdc delete own" ON public.challenge_daily_checklist FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_cdc_updated BEFORE UPDATE ON public.challenge_daily_checklist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Dias completos
CREATE TABLE public.challenge_completed_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 14),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);
ALTER TABLE public.challenge_completed_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ccd select own" ON public.challenge_completed_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ccd insert own" ON public.challenge_completed_days FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ccd delete own" ON public.challenge_completed_days FOR DELETE USING (auth.uid() = user_id);

-- 5) Pesos
CREATE TABLE public.challenge_weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 14),
  weight NUMERIC(5,2) NOT NULL CHECK (weight > 0 AND weight < 500),
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number)
);
ALTER TABLE public.challenge_weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cwl select own" ON public.challenge_weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cwl insert own" ON public.challenge_weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cwl update own" ON public.challenge_weight_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cwl delete own" ON public.challenge_weight_logs FOR DELETE USING (auth.uid() = user_id);

-- 6) Fotos de progresso
CREATE TABLE public.challenge_progress_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 14),
  photo_type TEXT NOT NULL CHECK (photo_type IN ('body','face')),
  photo_url TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_number, photo_type)
);
ALTER TABLE public.challenge_progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cpp select own" ON public.challenge_progress_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "cpp insert own" ON public.challenge_progress_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cpp update own" ON public.challenge_progress_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "cpp delete own" ON public.challenge_progress_photos FOR DELETE USING (auth.uid() = user_id);

-- 7) Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('challenge-photos','challenge-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "challenge-photos public read" ON storage.objects FOR SELECT
  USING (bucket_id = 'challenge-photos');
CREATE POLICY "challenge-photos user upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "challenge-photos user update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "challenge-photos user delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'challenge-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
