## Objetivo
Na página individual da loja (`/mercado-facil/loja/:id`), agrupar os produtos por categoria e exibir cada grupo em um carrossel horizontal, em vez do grid 2 colunas atual.

## Mudanças

**`src/pages/mercado-facil/Loja.tsx`**
1. Buscar também `mf_categorias` (id, name, icon_emoji, order) junto com lojas/produtos.
2. Agrupar `produtos` por `categoria_id`, ordenando categorias pelo campo `order`. Produtos sem categoria vão para um grupo "Outros" no final.
3. Para cada categoria com produtos, renderizar:
   - Cabeçalho com `icon_emoji` + nome + contador `(N)`
   - Carrossel horizontal (`overflow-x-auto`, scroll snap, `scrollbar-hide`) com `MFProductCard` em largura fixa (~ `w-40`/`w-44` para caber 2,2 cards visíveis no viewport 390px)
4. Remover o grid antigo `grid-cols-2`.

## Detalhes técnicos
- Carrossel: `flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 pb-2` com cada item `snap-start shrink-0 w-40`.
- `MFProductCard` precisa funcionar em largura fixa — verificar e ajustar caso esteja com `w-full` rígido (provavelmente já adapta ao container).
- Sem mudanças de schema, sem novo componente — mantém tudo dentro de `Loja.tsx`.

## Fora do escopo
- Filtro/busca por categoria.
- Mudanças no card do produto além de eventual ajuste de largura.
- Mudanças no header/banner da loja.