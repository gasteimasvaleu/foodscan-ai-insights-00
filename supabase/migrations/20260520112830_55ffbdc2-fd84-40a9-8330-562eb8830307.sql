ALTER TABLE public.mf_entregas REPLICA IDENTITY FULL;
ALTER TABLE public.mf_entregador_avaliacoes REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mf_entregas;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mf_entregador_avaliacoes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END$$;