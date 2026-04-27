## Restaurar card-título "Nossa Loja" na página /loja

Reinserir o card-título de seção que foi removido por engano, mantendo a Navbar global no topo.

### Mudanças em `src/pages/Loja.tsx`

1. Reimportar o ícone `ShoppingBag` em `lucide-react`.
2. Reinserir o bloco do card-título logo abaixo do container, antes do buscador:
   - Fundo `#FFD1E7`, `rounded-3xl shadow-xl p-5`.
   - Ícone `ShoppingBag` em quadrado branco translúcido.
   - Título "Nossa Loja" + subtítulo "Roupas, beleza, vitaminas e suplementos escolhidos a dedo.".

A Navbar global (`<Navbar />`) e o offset `pt-[calc(env(safe-area-inset-top)+5rem)]` permanecem.
