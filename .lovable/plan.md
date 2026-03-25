

## Corrigir sobreposição VideoOverlay + Loading States no FoodScan

### Problema
O `VideoOverlay` (fullscreen z-50) e o `LoadingState` inline (cérebro IA) são mostrados simultaneamente quando `isAnalyzing || isDescribing`. O overlay cobre completamente o loading inline, tornando-o invisível.

Existem 3 loading states inline:
- **Fresca/Manual**: `LoadingState` (cérebro IA rosa) — linha 610-613
- **Industrial**: `OpenFoodFactsLoadingState` (scanner verde) — linha 606-609
- **Barcode** não aciona o VideoOverlay atualmente

### Solução proposta
Remover os loading states inline (`LoadingState` e `OpenFoodFactsLoadingState`) quando o `VideoOverlay` estiver ativo, já que o overlay fullscreen substitui essa função visual. Também adicionar o `VideoOverlay` para o caso do barcode (`isBarcodeAnalyzing`), com mensagem diferente.

### Mudanças em `src/pages/FoodScan.tsx`

1. **Atualizar VideoOverlay** para cobrir todos os 3 casos com mensagens contextuais:
   - `isAnalyzing || isDescribing` → "Analisando seu prato..."
   - `isBarcodeAnalyzing` → "Consultando base de dados..."

2. **Remover os loading states inline** (`LoadingState` e `OpenFoodFactsLoadingState`) das condicionais de renderização, já que o VideoOverlay agora cumpre essa função.

3. **Ajustar a lógica condicional** no JSX: quando `isAnalyzing || isDescribing || isBarcodeAnalyzing`, não renderizar nada inline (o VideoOverlay já está visível por cima).

### Alternativa (se preferir manter ambos)
Se quiser manter os loading states inline visíveis **junto** com o VideoOverlay, posso reduzir a opacidade do overlay (`bg-black/30` em vez de `/60`) para que o conteúdo por baixo fique semi-visível. Mas recomendo a primeira abordagem — o VideoOverlay já é mais bonito e informativo.

