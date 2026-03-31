

## Ajustar layout dos botões do MealTypeSelector

Alterar o layout dos chips para ocupar toda a largura horizontal:
- **Linha 1**: 2 botões (Café da Manhã, Lanche) — cada um `flex-1`
- **Linha 2**: 3 botões (Almoço, Jantar, Ceia) — cada um `flex-1`

### Alteração em `src/components/MealTypeSelector.tsx`

Substituir o `flex-wrap gap-2` por duas linhas explícitas usando dois `div flex gap-2`, dividindo o array `MEAL_TYPES` em `slice(0,2)` e `slice(2,5)`, com botões usando `flex-1` para preencher a largura.

