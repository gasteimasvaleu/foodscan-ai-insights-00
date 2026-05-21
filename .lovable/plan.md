## Objetivo

No card de pedido específico em `/mercado-facil/lojista/pedidos`, mostrar para o lojista o mesmo acompanhamento de status da entrega que o cliente já vê (`MFEntregaProgress`: Aceita → Coletada → Entregue), atualizado em realtime conforme o motoboy avança o pedido.

## Mudanças

### `src/pages/mercado-facil/LojistaPedidos.tsx`

1. Importar `useMFEntregas` (com `scope: "lojista"`, já filtra por `lojista_id` e tem realtime nativo) e `MFEntregaProgress` + `ENTREGA_STATUS_LABEL`.
2. Chamar `const { entregas } = useMFEntregas({ scope: "lojista", userId: user?.id });` quando houver `user`.
3. Construir um mapa `entregasPorPedido = Map<order_log_id, MFEntrega>` para lookup O(1) no render.
4. Dentro do `pedidos.map((p) => …)`, recuperar `const entrega = entregasPorPedido.get(p.id)` e, quando existir, renderizar um bloco compacto logo abaixo da lista de itens com:
   - Cabeçalho enxuto: ícone `Truck` + `Entrega` + badge com `ENTREGA_STATUS_LABEL[entrega.status]` em rosa.
   - Quando `status === "disponivel"`: linha "Aguardando entregador aceitar…" com `Loader2 animate-spin`.
   - Quando `status === "aceita" | "coletada" | "entregue"`: renderizar `<MFEntregaProgress status={entrega.status} />`.
   - Quando `status === "cancelada"`: linha discreta "Entrega cancelada".
5. Esconder o botão "Entregador" quando já existir uma entrega ativa (`disponivel | aceita | coletada`) para esse pedido — evita criação duplicada. Continua aparecendo após `entregue`/`cancelada` somente se a loja aceitar entregador.
6. Pequeno container visual: bloco `rounded-2xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-3 space-y-2` para destacar a área de entrega dentro do card branco existente.

## Fora de escopo
- Sem mudanças de banco, RLS, edge functions ou hooks (o `useMFEntregas` com `scope: "lojista"` já tem realtime em `mf_entregas`).
- Sem mudanças no fluxo do entregador nem na visão do cliente.
- Sem alteração do Dialog de "Acionar entregador".

## Arquivo alterado
- `src/pages/mercado-facil/LojistaPedidos.tsx` (imports + render do card).
