

## Corrigir espaçamento do card título na página Receitas

### Problema
A página Receitas usa `pt-20` no container, enquanto as demais páginas usam `pt-[calc(env(safe-area-inset-top)+4rem)]` para compensar o notch do iPhone + navbar fixa.

### Alteração

**`src/pages/Receitas.tsx` (linha 112)**
- Trocar `pt-20` por `pt-[calc(env(safe-area-inset-top)+4rem)]`

