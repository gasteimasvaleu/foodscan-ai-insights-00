

## Corrigir navbar visível nas páginas internas do Profile

### Problema
As páginas WorkoutPlan, MyDiets e PhysicalAssessment têm backgrounds opacos (`bg-gradient-to-br`) que cobrem a faixa branca decorativa do navbar. O menu rosa aparece (z-40), mas a faixa branca fica por trás do conteúdo da página.

### Alterações

**1. `src/pages/WorkoutPlan.tsx`**
- Aumentar `pb-24` para `pb-40` no container principal para garantir espaço para a navbar + faixa branca

**2. `src/pages/MyDiets.tsx`**
- Aumentar `pb-24` para `pb-40` no container principal

**3. `src/pages/PhysicalAssessment.tsx`**
- Aumentar `pb-28` (ou o valor atual) para `pb-40` no container principal

Isso garante que o conteúdo termine antes da área da navbar, deixando a faixa branca e o menu visíveis em todas as páginas.

