create or replace function public.mf_recalc_entregador_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.mf_entregadores e
  set avaliacao_media = coalesce((
        select round(avg(nota)::numeric, 2)
        from public.mf_entregador_avaliacoes
        where entregador_id = e.id
      ), 0),
      total_entregas = (
        select count(*) from public.mf_entregador_avaliacoes
        where entregador_id = e.id
      ),
      updated_at = now()
  where e.id = NEW.entregador_id;
  return NEW;
end;
$$;

drop trigger if exists trg_mf_recalc_entregador_stats on public.mf_entregador_avaliacoes;
create trigger trg_mf_recalc_entregador_stats
after insert on public.mf_entregador_avaliacoes
for each row execute function public.mf_recalc_entregador_stats();