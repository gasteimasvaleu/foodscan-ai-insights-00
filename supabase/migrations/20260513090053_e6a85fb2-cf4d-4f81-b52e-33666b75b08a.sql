CREATE OR REPLACE FUNCTION public.get_quiz_play_questions(_quiz_id uuid)
RETURNS TABLE (
  question_id uuid,
  quiz_id uuid,
  question_position integer,
  prompt text,
  options jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.quiz_id, q.position, q.prompt, q.options
  FROM public.quiz_questions q
  JOIN public.quizzes z ON z.id = q.quiz_id
  WHERE q.quiz_id = _quiz_id AND z.status = 'published'
  ORDER BY q.position;
$$;

GRANT EXECUTE ON FUNCTION public.get_quiz_play_questions(uuid) TO authenticated;
