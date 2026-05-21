ALTER TABLE public.mf_order_log ADD COLUMN IF NOT EXISTS cliente_estado text;
ALTER TABLE public.mf_entregas  ADD COLUMN IF NOT EXISTS estado text;