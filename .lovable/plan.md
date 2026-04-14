

## Substituir inputs numéricos por sliders no AIGoalsWizard

### Problema
No iOS, ao focar em inputs numéricos, o teclado nativo empurra o Drawer para cima, quebrando o layout.

### Mudanças em `src/components/AIGoalsWizard.tsx`

**Step 2 (Idade)** — Remover o `<Input type="number">` (linhas 230-236), manter apenas o range slider que já existe (linhas 222-229). Trocar `<Input type="range">` pelo componente `<Slider>` de `@/components/ui/slider` para melhor visual.

**Step 3 (Peso)** — Substituir o `<Input type="number">` (linhas 251-257) por um `<Slider>` com min=30, max=250, step=1.

**Step 4 (Altura)** — Substituir o `<Input type="number">` (linhas 272-278) por um `<Slider>` com min=100, max=230, step=1.

**Step 8 (Restrições)** — Remover o bloco "Outra restrição" com Label + Input (linhas 411-419). Remover `otherRestriction` do payload enviado à edge function (ou manter no state mas sem UI).

### Resultado
Todos os steps usarão apenas interações de toque (sliders e cards), eliminando qualquer abertura do teclado nativo no iOS.

