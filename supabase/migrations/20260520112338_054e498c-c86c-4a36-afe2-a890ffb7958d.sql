alter table public.mf_entregadores
  add column if not exists taxa_min_centavos integer not null default 0,
  add column if not exists taxa_max_centavos integer not null default 0;