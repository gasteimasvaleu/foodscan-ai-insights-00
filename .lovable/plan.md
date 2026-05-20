## Plano — Avaliação do entregador

Quando o entregador marcar a entrega como **`entregue`**, o cliente vê um modal pedindo nota (1–5 estrelas) + comentário opcional. A média e o total recalculam automaticamente no perfil do entregador.

### 1. Migração — tabela + trigger

```sql
create table public.mf_entregador_avaliacoes (
  id uuid primary key default gen_random_uuid(),
  entrega_id uuid not null unique references public.mf_entregas(id) on delete cascade,
  entregador_id uuid not null references public.mf_entregadores(id) on delete cascade,
  cliente_id uuid not null,
  nota int not null check (nota between 1 and 5),
  comentario text,
  created_at timestamptz not null default now()
);

alter table public.mf_entregador_avaliacoes enable row level security;

-- Cliente vê e cria a própria avaliação; entregador vê as dele
create policy "cliente_select_own" on public.mf_entregador_avaliacoes
  for select using (auth.uid() = cliente_id or auth.uid() in (
    select user_id from public.mf_entregadores where id = entregador_id
  ));
create policy "cliente_insert_own" on public.mf_entregador_avaliacoes
  for insert with check (
    auth.uid() = cliente_id
    and exists (
      select 1 from public.mf_entregas e
      where e.id = entrega_id
        and e.cliente_id = auth.uid()
        and e.status = 'entregue'
        and e.entregador_id = entregador_id
    )
  );
```

Trigger `after insert` que recalcula `avaliacao_media` (avg) e `total_entregas` (count) na linha do entregador.

### 2. Hook — `useMFPendingRating`

`src/hooks/mercado-facil/useMFPendingRating.ts` — para o cliente logado, busca a primeira `mf_entregas` com `status='entregue'`, `cliente_id = me`, sem avaliação correspondente (left join). Retorna `{ entrega, entregador, dismiss(), submit(nota, comentario) }`.

### 3. Modal — `MFRatingModal`

`src/components/mercado-facil/MFRatingModal.tsx` usando o `Dialog` padrão do shadcn, no padrão do app:

- `bg-white/70 backdrop-blur-md` (glassmorphism)
- `rounded-3xl`, **`border-2 border-[#FD46A1]`** (borda rosa pedida)
- `max-w-sm w-[calc(100%-2rem)] mx-auto` — **não ocupa toda a largura**, mantém respiro lateral em mobile
- Conteúdo: foto + nome do entregador, "Como foi sua entrega?", 5 estrelas selecionáveis, textarea opcional, botão "Enviar avaliação" (bg `#FD46A1`) e "Avaliar depois" (ghost). Botão X fechar com `bg-[#FD46A1]` (padrão do app).

### 4. Integração

Montar `<MFRatingModal />` em `src/pages/mercado-facil/Index.tsx` (entrada do Mercado Fácil). Abre sozinho quando o hook devolver uma entrega pendente. "Avaliar depois" só fecha (volta a aparecer na próxima visita). Enviar grava a avaliação → trigger atualiza o entregador → modal fecha.

### Fora do escopo

- Não mexo no fluxo do entregador (`EntregadorEntregas`), nem em notificações push, nem em avaliação da loja.
- Sem mudança visual nos cards existentes.
