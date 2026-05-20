## Mudanças em `src/components/ui/tubelight-navbar.tsx`

Reverter as reduções de padding/gaps/ícone, mantendo os 7 itens:

- `gap-1 sm:gap-2` no container → voltar para `gap-2 sm:gap-3` (linha 111)
- `gap-1 sm:gap-2` no wrapper de items → voltar para `gap-2 sm:gap-3` (linha 132)
- Botão "Mais": `px-2 sm:px-3 ... min-w-[40px]` → voltar para `px-3 sm:px-4 ... min-w-[44px]` (linha 143)
- Ícone do "Mais": `size={24}` → voltar para `size={26}` (linha 152)
- Link de itens normais: `px-2 sm:px-3 ... min-w-[40px]` → voltar para `px-3 sm:px-4 ... min-w-[44px]` (linha 161)
- Ícone dos itens: `size={24}` → voltar para `size={26}` (linha 170)

## Fora de escopo
- Lista de items em `App.tsx` (mantém os 7 com Alimentos).
- Estilos visuais (cores, sombras, animações).
