DROP VIEW IF EXISTS public.quiz_questions_public;
CREATE VIEW public.quiz_questions_public AS
SELECT q.id, q.quiz_id, q.position, q.prompt, q.options
FROM public.quiz_questions q
JOIN public.quizzes z ON z.id = q.quiz_id
WHERE z.status = 'published';
GRANT SELECT ON public.quiz_questions_public TO authenticated;
