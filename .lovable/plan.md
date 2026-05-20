## Avaliação inline do entregador no status do pedido

### Problema
Hoje a avaliação aparece via modal global (`MFRatingModal` + `useMFPendingRating`) que não está funcionando confiavelmente. Quando o entregador marca como "entregue", a entrega some imediatamente do componente `MFClientePedidosStatus` no `/mercado-facil/carrinho` (o hook só busca `disponivel|aceita|coletada`), e o cliente nunca chega a avaliar.

### Solução
Manter a entrega visível no card de status quando estiver com status `entregue` e ainda não avaliada. No lugar do progresso, mostrar as 5 estrelinhas + campo opcional de comentário + botão "Enviar avaliação". Após enviar (ou após dispensar), a entrega some do card.

### Mudanças

1. **`src/hooks/mercado-facil/useMFEntregas.ts`**
   - No scope `cliente-ativas`, incluir `"entregue"` na lista de status retornados (`["disponivel", "aceita", "coletada", "entregue"]`).

2. **`src/components/mercado-facil/MFClientePedidosStatus.tsx`**
   - Para cada entrega:
     - Se status `disponivel` → "Buscando entregador…" (igual hoje).
     - Se `aceita` ou `coletada` → `MFEntregaProgress` (igual hoje).
     - Se `entregue`:
       - Verificar se já existe registro em `mf_entregador_avaliacoes` para essa `entrega_id` (consulta única com `.in("entrega_id", ids)` ao carregar).
       - Se já avaliada → não renderiza (filtra fora).
       - Se pendente → renderizar bloco "Avalie seu entregador" com 5 estrelas clicáveis, textarea opcional, botão "Enviar avaliação".
   - Ao enviar: `insert` em `mf_entregador_avaliacoes` (`entrega_id`, `entregador_id`, `autor_id = user.id`, `nota`, `comentario`). Atualizar estado local para sumir o item. Toast de confirmação.
   - O badge de contagem passa a refletir só entregas ainda relevantes (ativas + entregues pendentes de avaliação).

3. **Remover o sistema de modal global de avaliação** (não está funcionando e a UX agora vive no carrinho):
   - Remover uso de `MFRatingModal` e `useMFPendingRating` no(s) ponto(s) onde é montado (provavelmente `App.tsx` ou layout raiz — confirmar com `rg`).
   - Apagar arquivos `src/components/mercado-facil/MFRatingModal.tsx` e `src/hooks/mercado-facil/useMFPendingRating.ts`.

### Detalhes técnicos
- Reaproveitar o realtime já existente em `useMFEntregas` (escuta `*` em `mf_entregas`) — ao marcar entregue, o card aparece automaticamente.
- Filtrar entregas já avaliadas no próprio componente para evitar mexer no hook genérico.
- Validar mínimo de 1 estrela antes de habilitar o botão.