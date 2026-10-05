DROP POLICY IF EXISTS mf_produtos_select_public ON public.mf_produtos;
CREATE POLICY mf_produtos_select_public ON public.mf_produtos FOR SELECT
  USING (
    (ativo = true AND EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.ativa = true))
    OR EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );