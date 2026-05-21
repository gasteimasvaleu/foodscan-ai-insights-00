ALTER TABLE public.mf_order_log
  ADD COLUMN IF NOT EXISTS cliente_nome text,
  ADD COLUMN IF NOT EXISTS cliente_endereco text,
  ADD COLUMN IF NOT EXISTS cliente_cidade text,
  ADD COLUMN IF NOT EXISTS cliente_telefone text;