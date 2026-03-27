

## Corrigir overflow do chat NutriCoach quando teclado abre

### Problema
Modal usa `h-[85vh]` + posicionamento centrado fixo. No iOS, quando o teclado abre, o `vh` não muda, causando overflow horizontal e "estouro".

### Solução

**`src/pages/NutriCoach.tsx`** — apenas classes CSS do `DialogContent` (linha ~244):

1. `h-[85vh]` → `h-[85dvh]` — viewport dinâmico que encolhe/cresce com o teclado
2. Ancorar modal no bottom em vez de center: `!top-auto !bottom-0 !translate-y-0 !left-0 !translate-x-0`
3. Adicionar `overflow-hidden` e `box-border` para prevenir qualquer overflow residual
4. Manter `w-[calc(100%-2rem)] max-w-lg mx-auto` para centralização horizontal

### Comportamento
- Teclado abre → modal encolhe automaticamente
- Teclado fecha → modal volta a 85% da tela
- Sem scroll horizontal em nenhum momento

