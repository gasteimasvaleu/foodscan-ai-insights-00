## Contexto

O `MFRatingModal` é montado globalmente no `App.tsx` e o hook `useMFPendingRating` busca entregas com `cliente_id = user.id` e `status = 'entregue'` ainda não avaliadas. Confirmei via banco:

- Existem 2 entregas com `status='entregue'` para o cliente `acbf0c18-...`, ambas sem `mf_entregador_avaliacoes`.
- O entregador associado existe.
- RLS permite ao cliente ler suas próprias entregas.
- A tabela `mf_entregas` está na publication `supabase_realtime`.

Ou seja, em tese o modal deveria aparecer — o problema é que o gatilho atual depende de **dois eventos frágeis**:

1. Supabase Realtime entregar o `postgres_changes` UPDATE no exato instante (pode falhar se a app estiver em background, conexão caiu, ou troca rápida de rota desmontou o canal).
2. O `load()` inicial só roda quando `user.id` muda — se o cliente já estava logado e na app antes da entrega, e a subscription perdeu o evento, nada dispara depois.

Não há fallback. Por isso o cliente em outro device pode ter ficado sem ver o modal.

## O que mudar

Tornar a detecção do modal redundante para que, mesmo sem Realtime, ele apareça em segundos:

### 1. `src/hooks/mercado-facil/useMFPendingRating.ts`
- Adicionar **polling leve** (a cada 20s) chamando `load()` enquanto a aba estiver visível. Sai do polling em background pra não gastar bateria.
- Disparar `load()` também em **focus da janela** (`window.addEventListener("focus", ...)`) — complementa o `visibilitychange` que já existe.
- Disparar `load()` em **mudança de rota** usando `useLocation()` do react-router (qualquer navegação re-checa pendentes).
- Logar `[mf_rating] load → pendente?` no console em dev pra facilitar diagnóstico futuro.
- Manter o canal Realtime atual como caminho rápido quando funciona.

### 2. Pequeno hardening do canal Realtime
- Trocar o nome do canal de `mf-rating-${user.id}` para um nome estável + cleanup garantido, e reassinar quando a aba volta a ficar visível (algumas vezes o socket fica "stale" em mobile).

### 3. Sem mudanças em RLS, schema ou na lógica do `marcarEntregue`
A regra de negócio continua: o cliente é quem avalia, e só uma vez por entrega. Nada muda pro motoboy.

## Diagrama do fluxo após a mudança

```text
Motoboy marca entregue
        │
        ▼
UPDATE mf_entregas (status='entregue')
        │
        ├─► Realtime push ───► load() ──► abre modal (caminho rápido)
        │
        └─► (se Realtime falhar)
              cliente abre/volta pro app ──► focus/visibility ──► load() ──► abre modal
              ou polling de 20s ────────────────────────────────► load() ──► abre modal
```

## Fora de escopo

- Push notification nativa pro cliente avisando "avalie sua entrega" (posso planejar depois se quiser).
- Modal de confirmação pro motoboy após marcar entregue.
- Mudanças visuais no `MFRatingModal`.

## Detalhes técnicos

- Polling usa `setInterval(load, 20000)` dentro do `useEffect` que depende de `user?.id`, com `clearInterval` no cleanup.
- O guard `if (document.visibilityState !== 'visible') return;` no callback evita chamadas em background.
- `useLocation().pathname` no deps do effect dispara `load()` em cada navegação.
- Nenhuma query nova é feita se `user` for null.
