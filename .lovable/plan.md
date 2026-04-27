## Objetivo
Os cards de produto no carrossel da `/loja` estão com a sombra/parte inferior levemente cortada pelo overflow do Embla Carousel. Adicionar respiro vertical no contêiner do carrossel.

## Mudança

### `src/components/loja/ProductCarousel.tsx`
- Linha 49: adicionar `py-2` ao `CarouselContent` para criar espaço vertical e evitar o corte da sombra inferior dos cards.
  - De: `<CarouselContent className="-ml-3">`
  - Para: `<CarouselContent className="-ml-3 py-2">`

## Resultado
Os cards passam a ser exibidos por inteiro, com a sombra inferior visível, sem alterar largura nem layout dos itens.
