## Aumentar e reposicionar a badge "18:6"

Editar somente `src/components/DailyFastingSummaryCard.tsx`.

### Mudanças

1. **Remover a badge do header** (linhas 155-159): tirar o `<span>` absolute com `{protocol}` que fica colado no topo direito.

2. **Adicionar a badge maior na coluna de texto**, alinhada com o "17h39":
   - Dentro do bloco `isFasting`, ao lado do número grande `formatTime(remainingHours)`, envolver os dois em um `flex items-baseline gap-2`.
   - Badge maior: `text-sm font-bold bg-white/25 rounded-full px-2.5 py-1 leading-none` para ficar visível na altura do hero time.
   
   Resultado: `[17h39] [18:6]` lado a lado, com a badge bem alinhada à baseline do tempo principal.

Sem mudanças em lógica, dados ou outros componentes.
