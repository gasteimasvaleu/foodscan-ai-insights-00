## Problema

O modal de avaliação do entregador (`MFRatingModal`) só é montado em `/mercado-facil` (Index do cliente) e só busca entregas no `useEffect` inicial. Hoje:

- O cliente vê o modal apenas se entrar/recarregar `/mercado-facil` *após* o entregador marcar como "entregue".
- Se o cliente já estava com a aba aberta, nada acontece em tempo real.
- Em outras rotas do app do cliente (carrinho, busca etc.) o modal nem existe.

No banco existe a entrega `ab45…c5fc` com status `entregue` — ou seja, os dados estão certos; o problema é só de gatilho/montagem do modal.

## Plano

1. **Realtime no `useMFPendingRating`** — assinar `postgres_changes` em `mf_entregas` filtrado por `cliente_id=user.id`. Quando chegar um UPDATE com `status='entregue'`, chamar `load()` para abrir o modal imediatamente. Também reagir a INSERT/DELETE em `mf_entregador_avaliacoes` para sumir com o modal se já avaliada em outra aba. Limpar o canal no cleanup.

2. **Disponibilizar o modal globalmente para o cliente** — mover `<MFRatingModal />` de `src/pages/mercado-facil/Index.tsx` para um ponto compartilhado das rotas do cliente (ex.: dentro do layout/wrapper de `/mercado-facil/*` que NÃO seja entregador). Assim o modal aparece em qualquer página do Mercado Fácil onde o cliente esteja navegando.

   - Verificar se existe um layout de rotas; se não, adicionar o componente nas páginas principais do fluxo do cliente (Index, busca, loja, carrinho). Não montar nas rotas `/mercado-facil/entregador/*`.

3. **Polling leve de segurança** — além do realtime, fazer `reload()` quando a aba volta ao foco (`visibilitychange`) para cobrir cenários sem realtime (PWA suspenso, conexão caiu).

4. **Sem mudanças no fluxo do entregador** — `EntregadorEntregas.tsx` continua marcando `status='entregue'` igual hoje; só o lado do cliente passa a reagir.

## Detalhes técnicos

- Em `useMFPendingRating.ts`:
  - Após `useEffect(load)`, adicionar outro `useEffect` que cria `supabase.channel('mf-rating-' + user.id)` com dois `on('postgres_changes', …)`:
    - `{ event: 'UPDATE', schema: 'public', table: 'mf_entregas', filter: 'cliente_id=eq.<uid>' }` → `load()`
    - `{ event: 'INSERT', schema: 'public', table: 'mf_entregador_avaliacoes', filter: 'autor_id=eq.<uid>' }` → `load()`
  - Adicionar listener `document.addEventListener('visibilitychange', …)` que chama `load()` quando `document.visibilityState === 'visible'`.
  - Cleanup remove canal e listener.

- Garantir que `mf_entregas` e `mf_entregador_avaliacoes` estão em `supabase_realtime` publication (rodar migration `ALTER PUBLICATION supabase_realtime ADD TABLE …` se ainda não estiverem; é idempotente via `DO $$ … EXCEPTION WHEN duplicate_object`).

- Modal: trocar a montagem única em `Index.tsx` por montagem nas rotas do cliente do Mercado Fácil (ou um wrapper de layout se existir). Confirmar com `rg` quais páginas formam o app do cliente antes de editar.

## Fora de escopo

- Mudar UX do modal, copy, design.
- Tocar no painel do entregador.
- Permitir reabrir avaliações já enviadas.