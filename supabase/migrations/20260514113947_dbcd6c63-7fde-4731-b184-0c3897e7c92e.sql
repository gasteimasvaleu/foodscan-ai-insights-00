-- Reforça política de INSERT em post_comments: qualquer usuário autenticado
-- pode comentar em qualquer post existente, desde que user_id seja o próprio.
DROP POLICY IF EXISTS "Users can create their own comments" ON public.post_comments;

CREATE POLICY "Authenticated users can comment on existing posts"
ON public.post_comments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.community_posts p WHERE p.id = post_id)
);