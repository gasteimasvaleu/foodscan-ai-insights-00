CREATE POLICY "Admins can view all registration tokens"
ON public.registration_tokens
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));