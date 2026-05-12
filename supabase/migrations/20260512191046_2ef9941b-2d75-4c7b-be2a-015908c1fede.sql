-- Tabela: menstrual_cycles
CREATE TABLE public.menstrual_cycles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  cycle_start_date date NOT NULL,
  cycle_length_days integer NOT NULL DEFAULT 28,
  period_length_days integer NOT NULL DEFAULT 5,
  flow text,
  mood text,
  symptoms text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_menstrual_cycles_user_date ON public.menstrual_cycles (user_id, cycle_start_date DESC);

ALTER TABLE public.menstrual_cycles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own cycles" ON public.menstrual_cycles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own cycles" ON public.menstrual_cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own cycles" ON public.menstrual_cycles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own cycles" ON public.menstrual_cycles
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_menstrual_cycles_updated_at
  BEFORE UPDATE ON public.menstrual_cycles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela: preconception_checklist
CREATE TABLE public.preconception_checklist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_key text NOT NULL,
  checked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_key)
);

CREATE INDEX idx_preconception_checklist_user ON public.preconception_checklist (user_id);

ALTER TABLE public.preconception_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own checklist" ON public.preconception_checklist
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own checklist" ON public.preconception_checklist
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own checklist" ON public.preconception_checklist
  FOR DELETE USING (auth.uid() = user_id);