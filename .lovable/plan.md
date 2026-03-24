

## Corrigir empilhamento dos cards QuickActions

No screenshot de referência, o **ultimo card fica na frente** (z-index mais alto) e os primeiros ficam por trás. Atualmente o código faz o inverso (`zIndex: actions.length - index`).

### Alterações

**`src/components/QuickActions.tsx`**:
- Inverter z-index: `zIndex: index` (ultimo card = maior z-index)
- Aumentar sobreposição negativa (`-space-y-6` ou similar) para que os cards fiquem bem sobrepostos, mostrando apenas o topo de cada um
- Cada card precisa de altura maior (~120px via `min-h-[120px]`) e padding-top generoso para que o conteúdo visível fique no topo do card
- Último card sem margin-bottom, colado ao menu inferior

**`src/pages/Index.tsx`**:
- Remover padding-bottom do container ou ajustar para que o último card fique colado com a faixa branca do menu inferior

**`src/index.css`**:
- Remover o `padding-bottom: 100px` global do body (que foi adicionado antes) pois agora os cards devem ficar colados ao menu

### Resultado visual
Os cards ficam empilhados como um baralho de cartas, onde só se vê o topo de cada card (icone + titulo), exceto o último que fica totalmente visível na frente, encostado no menu inferior.

