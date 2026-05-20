create or replace function public.mf_entregadores_disponiveis(_cidade text)
returns setof public.mf_entregadores
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.mf_entregadores
  where status = 'aprovado'
    and disponivel = true
    and lower(unaccent(cidade)) = lower(unaccent(coalesce(_cidade,'')))
  order by avaliacao_media desc
  limit 10;
$$;

grant execute on function public.mf_entregadores_disponiveis(text) to anon, authenticated;