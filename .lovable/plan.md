Boa ideia 👍 — faz total sentido reaproveitar o `MFEntregaProgress` no carrinho pra dar transparência pro cliente.

## O que vou fazer

### 1. Novo escopo no `useMFEntregas`: `cliente-ativas`
Em `src/hooks/mercado-facil/useMFEntregas.ts`:
- Adicionar branch `scope === "cliente-ativas"` filtrando `cliente_id = userId` com `status IN ('disponivel','aceita','coletada')`, ordenando pelas mais recentes.
- Já herda o realtime atual (canal de `mf_entregas`), então o card atualiza sozinho conforme o entregador muda o status.

### 2. Novo componente `MFClientePedidosStatus`
Arquivo: `src/components/mercado-facil/MFClientePedidosStatus.tsx`
- Usa `useMFEntregas({ scope: "cliente-ativas", userId: user.id })`.
- Se não houver entregas ativas → não renderiza nada (silencioso).
- Se houver → mostra **um único botão sanfona** no padrão do app: card branco com borda rosa, rounded-3xl, texto "Ver status do pedido" + contador (ex: "Ver status do pedido (2)") + chevron que gira.
- Expandido: lista cada entrega ativa em um mini-card `bg-[#FFD1E7]/40` contendo:
  - Endereço de entrega (truncado)
  - Status traduzido ("Aguardando entregador", "Aceita", "A caminho da loja", "A caminho de você") via `ENTREGA_STATUS_LABEL`
  - `MFEntregaProgress` quando `status ∈ {aceita, coletada}` (pra status `disponivel` mostra só um texto "Buscando entregador…" com spinner sutil)
  - Taxa em destaque (`formatBRL` ou "A combinar")
- Animação de sanfona: `max-height` + `opacity` com `transition-all duration-300`, sem libs novas.

### 3. Montar no `Carrinho.tsx`
- Adicionar `<MFClientePedidosStatus />` logo abaixo do `<MFHeader>` (acima do bloco de "Entrega" ou do "carrinho vazio"), assim aparece tanto quando o carrinho tem itens quanto quando está vazio.

## Fora de escopo
- Não mexer no card do entregador (continua igual).
- Não criar histórico de entregas concluídas aqui (o modal de avaliação já cuida do pós-entrega).
- Sem mudanças em DB / RLS — `cliente_id = auth.uid()` já é permitido pelo policy `Ver entregas`.

## Diagrama do card no carrinho

```text
┌──────────────────────────────────────────┐
│ Ver status do pedido (1)            ▾    │  ← fechado (padrão)
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Ver status do pedido (1)            ▴    │
├──────────────────────────────────────────┤
│ Rua X, 123 — Bairro                      │
│ ●━━━━━━━●─────────○                       │
│ Aceita   Coletada  Entregue              │
│                          R$ 12,00        │
└──────────────────────────────────────────┘
```

## Detalhes técnicos

- Status `disponivel` não tem etapa no `MFEntregaProgress` (ele só cobre `aceita | coletada | entregue`); por isso esse caso mostra texto "Buscando entregador…" + spinner pequeno.
- Realtime: cada update de `mf_entregas` já chama `fetch()` no hook → re-render automático do progress.
- Quando uma entrega vira `entregue`, ela some dessa lista (status sai do filtro) e o `MFRatingModal` global assume o pós-fluxo.
- Acessibilidade: botão sanfona com `aria-expanded` e `aria-controls`.
