## Objetivo
Adicionar um card de busca de produtos logo abaixo do card header da loja em `/mercado-facil/loja/:id`. A busca filtra os produtos exibidos nos carrosséis por categoria em tempo real.

## Mudanças em `src/pages/mercado-facil/Loja.tsx`
1. Novo estado `search` (string).
2. Card de busca entre o header da loja e os carrosséis:
   - `bg-white border border-[#FD46A1]/30 rounded-3xl p-3`
   - Input com ícone `Search` (lucide) à esquerda, placeholder "Buscar produtos..."
   - Botão `X` à direita para limpar quando há texto
   - `className="text-base"` no input (regra iOS zoom)
3. Filtrar `produtos` por `nome` (case/acento-insensitive simples via `.toLowerCase().includes`) antes do `useMemo` de `grupos`, para que os carrosséis reflitam o termo.
4. Se o termo não retornar nada, exibir mensagem "Nenhum produto encontrado".

## Fora do escopo
- Busca por categoria/preço/promo.
- Histórico de buscas, debounce avançado.
- Mudanças no header da loja ou no `MFProductCard`.