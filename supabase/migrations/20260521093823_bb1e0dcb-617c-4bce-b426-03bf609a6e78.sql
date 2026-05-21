CREATE POLICY mf_order_log_delete_lojista ON public.mf_order_log FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.mf_lojas l WHERE l.id = loja_id AND l.owner_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );