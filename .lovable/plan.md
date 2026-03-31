

## Ajustar grid dos macronutrientes para 2x2

Alterar o grid dos 4 cards (Calorias, Carboidratos, Proteínas, Gorduras) no `DailyGoals.tsx` de 1 coluna para 2 colunas no mobile.

### Alteração em `src/components/DailyGoals.tsx`

Linha 99: trocar `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` por `grid-cols-2` para que fiquem sempre 2 por linha em qualquer viewport.

