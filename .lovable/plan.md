## Objetivo
Tornar os cards de produto do carrossel da página `/loja` mais compactos, reduzindo a imagem e ajustando proporcionalmente os textos e o botão, permitindo mostrar mais itens visíveis no scroll horizontal.

## Mudanças

### 1. `src/components/loja/ProductCarousel.tsx`
- Ajustar a largura dos itens do carrossel para mostrar mais produtos por tela:
  - De `basis-[45%] sm:basis-[35%]` para `basis-[38%] sm:basis-[28%]`.

### 2. `src/components/loja/ProductCard.tsx`
- Reduzir a área da imagem mantendo o aspect ratio quadrado (a imagem fica menor porque o card como um todo encolhe via basis acima).
- Compactar o conteúdo interno:
  - Padding: `p-3` → `p-2`
  - Gap interno: `gap-2` → `gap-1.5`
  - Título: `text-sm` → `text-xs`, `min-h-[2.5rem]` → `min-h-[2rem]`
  - Preço: `text-base` → `text-sm`
  - Botão: manter `size="sm"` mas reduzir altura/padding com classes `h-7 text-xs px-2`, ícone `w-3 h-3`.

## Resultado esperado
Cards visivelmente menores no carrossel, com imagem proporcional menor, mantendo legibilidade do nome, preço e botão "Comprar". O usuário verá ~2.5 cards por tela em mobile (390px) em vez de ~2.
