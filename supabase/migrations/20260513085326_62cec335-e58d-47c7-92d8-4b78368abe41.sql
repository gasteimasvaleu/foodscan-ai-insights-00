
-- Quizzes
CREATE TABLE public.quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text NOT NULL DEFAULT 'geral',
  difficulty text NOT NULL DEFAULT 'medio',
  time_per_question_seconds integer NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published quizzes"
  ON public.quizzes FOR SELECT TO authenticated
  USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage quizzes"
  ON public.quizzes FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_quizzes_updated_at BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Quiz questions
CREATE TABLE public.quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  prompt text NOT NULL,
  options jsonb NOT NULL,
  correct_index smallint NOT NULL,
  explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, position);

CREATE POLICY "Admins manage quiz_questions"
  ON public.quiz_questions FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- View pública sem resposta correta
CREATE VIEW public.quiz_questions_public
WITH (security_invoker = true) AS
SELECT q.id, q.quiz_id, q.position, q.prompt, q.options
FROM public.quiz_questions q
JOIN public.quizzes z ON z.id = q.quiz_id
WHERE z.status = 'published';

GRANT SELECT ON public.quiz_questions_public TO authenticated;

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  score integer NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  total_time_ms integer NOT NULL DEFAULT 0,
  is_perfect boolean NOT NULL DEFAULT false,
  pro_bonus_applied boolean NOT NULL DEFAULT false,
  UNIQUE (quiz_id, user_id)
);
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz_score ON public.quiz_attempts(quiz_id, score DESC);

CREATE POLICY "Users view own attempts or admins"
  ON public.quiz_attempts FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users insert own attempts"
  ON public.quiz_attempts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own attempts"
  ON public.quiz_attempts FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Attempt answers
CREATE TABLE public.quiz_attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  chosen_index smallint NOT NULL,
  is_correct boolean NOT NULL,
  time_ms integer NOT NULL DEFAULT 0,
  points_awarded integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, question_id)
);
ALTER TABLE public.quiz_attempt_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own answers or admins"
  ON public.quiz_attempt_answers FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.quiz_attempts a WHERE a.id = attempt_id AND (a.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role)))
  );

-- Função de ranking
CREATE OR REPLACE FUNCTION public.get_quiz_ranking(period text DEFAULT 'all_time')
RETURNS TABLE (
  user_id uuid,
  name text,
  avatar_url text,
  is_pro boolean,
  total_score bigint,
  attempts_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.user_id,
    COALESCE(p.name, 'Usuário') AS name,
    p.avatar_url,
    COALESCE(s.subscribed, false) AS is_pro,
    SUM(a.score)::bigint AS total_score,
    COUNT(*)::bigint AS attempts_count
  FROM public.quiz_attempts a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  LEFT JOIN public.subscribers s ON s.user_id = a.user_id
  WHERE a.finished_at IS NOT NULL
    AND (
      period = 'all_time'
      OR (period = 'weekly'  AND a.finished_at >= date_trunc('week', now()))
      OR (period = 'monthly' AND a.finished_at >= date_trunc('month', now()))
    )
  GROUP BY a.user_id, p.name, p.avatar_url, s.subscribed
  ORDER BY total_score DESC
  LIMIT 50;
$$;
