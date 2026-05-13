
-- user_streaks
CREATE TABLE public.user_streaks (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak int NOT NULL DEFAULT 0,
  longest_streak int NOT NULL DEFAULT 0,
  last_activity_date date,
  streak_freezes int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own streak" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own streak" ON public.user_streaks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users insert own streak" ON public.user_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- badges catalog
CREATE TABLE public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🏅',
  tier text NOT NULL DEFAULT 'bronze',
  category text NOT NULL DEFAULT 'geral',
  condition_type text NOT NULL,
  condition_value int NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active badges" ON public.badges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins manage badges insert" ON public.badges FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage badges update" ON public.badges FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage badges delete" ON public.badges FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

-- user_badges
CREATE TABLE public.user_badges (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own badges" ON public.user_badges FOR SELECT USING (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_badges;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_streaks;

-- Function: check and unlock badges
CREATE OR REPLACE FUNCTION public.check_and_unlock_badges(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_streak int;
  _total_meals int;
  _quiz_perfect int;
BEGIN
  SELECT current_streak INTO _current_streak FROM public.user_streaks WHERE user_id = _user_id;
  SELECT count(*) INTO _total_meals FROM public.meal_records WHERE user_id = _user_id;
  SELECT count(*) INTO _quiz_perfect FROM public.quiz_attempts WHERE user_id = _user_id AND is_perfect = true;

  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT _user_id, b.id FROM public.badges b
  WHERE b.is_active = true AND (
    (b.condition_type = 'streak_days' AND COALESCE(_current_streak, 0) >= b.condition_value) OR
    (b.condition_type = 'total_meals' AND _total_meals >= b.condition_value) OR
    (b.condition_type = 'quiz_perfect_count' AND _quiz_perfect >= b.condition_value)
  )
  ON CONFLICT (user_id, badge_id) DO NOTHING;
END;
$$;

-- Function: update streak on meal record
CREATE OR REPLACE FUNCTION public.update_user_streak_on_meal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _today date;
  _last date;
  _gap int;
  _freezes int;
  _current int;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  _today := (now() AT TIME ZONE 'America/Sao_Paulo')::date;

  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (NEW.user_id, 1, 1, _today)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_activity_date, streak_freezes, current_streak
    INTO _last, _freezes, _current
  FROM public.user_streaks WHERE user_id = NEW.user_id;

  IF _last = _today THEN
    -- no-op
    NULL;
  ELSE
    _gap := _today - COALESCE(_last, _today - 1);
    IF _gap = 1 THEN
      UPDATE public.user_streaks
      SET current_streak = _current + 1,
          longest_streak = GREATEST(longest_streak, _current + 1),
          last_activity_date = _today,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF _gap = 2 AND _freezes > 0 THEN
      UPDATE public.user_streaks
      SET streak_freezes = _freezes - 1,
          last_activity_date = _today,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    ELSIF _gap > 1 THEN
      UPDATE public.user_streaks
      SET current_streak = 1,
          longest_streak = GREATEST(longest_streak, 1),
          last_activity_date = _today,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;

  PERFORM public.check_and_unlock_badges(NEW.user_id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'update_user_streak_on_meal failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_streak_on_meal
AFTER INSERT ON public.meal_records
FOR EACH ROW EXECUTE FUNCTION public.update_user_streak_on_meal();

-- Trigger: check badges after quiz attempt finished
CREATE OR REPLACE FUNCTION public.check_badges_on_quiz()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.finished_at IS NOT NULL AND (OLD.finished_at IS NULL OR OLD.finished_at IS DISTINCT FROM NEW.finished_at) THEN
    PERFORM public.check_and_unlock_badges(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_badges_on_quiz
AFTER UPDATE ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.check_badges_on_quiz();

-- Seed badges
INSERT INTO public.badges (code, name, description, icon, tier, category, condition_type, condition_value) VALUES
('streak_3', 'Começando bem', 'Sequência de 3 dias registrando refeições', '🔥', 'bronze', 'streak', 'streak_days', 3),
('streak_7', 'Semana firme', 'Sequência de 7 dias', '🔥', 'bronze', 'streak', 'streak_days', 7),
('streak_14', 'Duas semanas', 'Sequência de 14 dias', '🔥', 'prata', 'streak', 'streak_days', 14),
('streak_30', 'Mês completo', 'Sequência de 30 dias', '🔥', 'ouro', 'streak', 'streak_days', 30),
('streak_60', 'Disciplina total', 'Sequência de 60 dias', '🔥', 'ouro', 'streak', 'streak_days', 60),
('streak_100', 'Centena de fogo', 'Sequência de 100 dias', '🏆', 'ouro', 'streak', 'streak_days', 100),
('meals_10', 'Primeiros passos', '10 refeições registradas', '🍽️', 'bronze', 'refeicoes', 'total_meals', 10),
('meals_50', 'Constância', '50 refeições registradas', '🍽️', 'bronze', 'refeicoes', 'total_meals', 50),
('meals_100', 'Cem refeições', '100 refeições registradas', '🍽️', 'prata', 'refeicoes', 'total_meals', 100),
('meals_365', 'Ano cheio', '365 refeições registradas', '🥇', 'ouro', 'refeicoes', 'total_meals', 365),
('quiz_perfect_1', 'Acertou em cheio', 'Primeiro quiz perfeito', '🎯', 'bronze', 'quiz', 'quiz_perfect_count', 1),
('quiz_perfect_5', 'Mente afiada', '5 quizzes perfeitos', '🎯', 'prata', 'quiz', 'quiz_perfect_count', 5),
('quiz_perfect_25', 'Gênio nutricional', '25 quizzes perfeitos', '🧠', 'ouro', 'quiz', 'quiz_perfect_count', 25);
