

## Corrigir padding superior da página Gráficos de Progresso

### Problema
A página `/graficos-progresso` usa `pt-[calc(env(safe-area-inset-top)+3.5rem)]` no container externo **e** `py-8` no container interno, resultando em espaço excessivo entre a navbar e o card título.

### Solução

**`src/pages/ChartsProgress.tsx` (linha 266-267)**:
- Alterar `pt-[calc(env(safe-area-inset-top)+3.5rem)]` para `pt-[calc(env(safe-area-inset-top)+4rem)]` (padrão das outras páginas)
- Trocar `py-8` por `pb-8` no container interno para remover o padding top extra, mantendo o espaçamento inferior

