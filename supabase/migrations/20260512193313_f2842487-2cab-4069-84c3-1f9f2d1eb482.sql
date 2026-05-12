-- baby_profile (1 por usuário)
CREATE TABLE public.baby_profile (
  user_id uuid NOT NULL PRIMARY KEY,
  name text NOT NULL,
  birth_date date NOT NULL,
  sex text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.baby_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own baby" ON public.baby_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own baby" ON public.baby_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own baby" ON public.baby_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own baby" ON public.baby_profile FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER baby_profile_updated_at BEFORE UPDATE ON public.baby_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- baby_growth
CREATE TABLE public.baby_growth (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recorded_at date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg numeric,
  height_cm numeric,
  head_cm numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.baby_growth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own growth" ON public.baby_growth FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own growth" ON public.baby_growth FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own growth" ON public.baby_growth FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own growth" ON public.baby_growth FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX baby_growth_user_date_idx ON public.baby_growth(user_id, recorded_at DESC);

-- baby_sleep
CREATE TABLE public.baby_sleep (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL,
  ended_at timestamptz NOT NULL,
  kind text NOT NULL DEFAULT 'soneca',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.baby_sleep ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bsleep" ON public.baby_sleep FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bsleep" ON public.baby_sleep FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own bsleep" ON public.baby_sleep FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own bsleep" ON public.baby_sleep FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX baby_sleep_user_started_idx ON public.baby_sleep(user_id, started_at DESC);

-- baby_feedings
CREATE TABLE public.baby_feedings (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fed_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  amount_ml numeric,
  duration_min numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.baby_feedings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own feedings" ON public.baby_feedings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own feedings" ON public.baby_feedings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own feedings" ON public.baby_feedings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own feedings" ON public.baby_feedings FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX baby_feedings_user_fed_idx ON public.baby_feedings(user_id, fed_at DESC);

-- baby_diapers
CREATE TABLE public.baby_diapers (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now(),
  kind text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.baby_diapers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own diapers" ON public.baby_diapers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own diapers" ON public.baby_diapers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own diapers" ON public.baby_diapers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own diapers" ON public.baby_diapers FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX baby_diapers_user_changed_idx ON public.baby_diapers(user_id, changed_at DESC);

-- baby_checklist (vacinas + marcos)
CREATE TABLE public.baby_checklist (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_key text NOT NULL,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_key)
);
ALTER TABLE public.baby_checklist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bcheck" ON public.baby_checklist FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own bcheck" ON public.baby_checklist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own bcheck" ON public.baby_checklist FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX baby_checklist_user_idx ON public.baby_checklist(user_id);