# Reduzir tamanho dos cards do carrossel "Ofertas em destaque"

Mudança visual pequena em `src/components/mercado-facil/OfertasDestaqueCarousel.tsx`:

- Card: `w-[240px] h-[320px]` → `w-[170px] h-[230px]`
- Skeleton: mesmas dimensões novas
- Padding interno do conteúdo: `p-4` → `p-3`
- Tag de desconto: `top-3 left-3` → `top-2 left-2`, `text-xs` → `text-[10px]`, `px-2.5 py-1` → `px-2 py-0.5`
- Título: `text-base` → `text-sm`
- Loja: mantém `text-xs` mas com `mt-0.5`
- Preço riscado: `text-[11px]` mantém
- Preço promo: `text-lg` → `text-base`
- Botão circular CTA: `h-9 w-9` → `h-7 w-7`, ícone `w-4 h-4` → `w-3.5 h-3.5`

Resultado: ~30% menor, cabem ~2 cards visíveis no viewport 390px (antes ~1.5), mantendo todo o conteúdo legível.

Fora de escopo: estrutura, query, cores, animações.
