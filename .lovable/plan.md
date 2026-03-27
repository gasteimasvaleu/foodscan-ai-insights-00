

## Alterar grid dos cards de Ações Rápidas para 1 por linha

### Mudança

**`src/pages/Profile.tsx` (linha 239)** — Alterar a classe do grid de `grid-cols-2 md:grid-cols-3` para `grid-cols-1`, e mudar o layout de cada card de vertical (`flex-col items-center`) para horizontal (`flex-row items-center`) para melhor aproveitamento do espaço em uma coluna.

