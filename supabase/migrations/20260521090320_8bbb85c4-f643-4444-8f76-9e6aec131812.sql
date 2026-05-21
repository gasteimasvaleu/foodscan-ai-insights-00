ALTER TABLE public.mf_lojas
  ADD COLUMN IF NOT EXISTS quem_aciona_entregador text NOT NULL DEFAULT 'loja'
  CHECK (quem_aciona_entregador IN ('loja','cliente'));