## Ajustes na página /loja

### 1. Corrigir padding superior excessivo
A página `/loja` usa `pt-[calc(env(safe-area-inset-top)+5rem)]`, enquanto o padrão das demais páginas internas (Provador, About, FacaEmCasa, NutriCoach, Objetivos, etc.) é `+4rem`. Reduzir para alinhar com o restante do app.

- **`src/pages/Loja.tsx`** (linha 94): trocar `+5rem` por `+4rem`.

### 2. Modal de detalhes do produto

Hoje o `ProductCard` só tem o botão "Comprar". Vamos adicionar a possibilidade de **clicar na imagem** do produto para abrir um modal com as informações completas.

**Novo componente** `src/components/loja/ProductDetailsModal.tsx`:
- Usa o `Dialog` do shadcn já existente, seguindo o padrão visual de modais do app (glassmorphism `bg-white/70 backdrop-blur-md`, borda rosa `border-2 border-primary`, cantos `rounded-3xl`, botão X destacado em rosa — conforme `mem://style/ui-modals` e `mem://style/ui-buttons-refined`).
- Conteúdo:
  - Imagem grande do produto (aspect-square, `rounded-2xl`)
  - Nome do produto (título)
  - Preço formatado em BRL com cor primária
  - Categoria + subcategoria (badges discretos)
  - Descrição completa (`product.description`) com scroll se longa
  - Botão "Comprar" full-width na cor primária, reaproveita `openExternalUrl(product.affiliate_url)`

**Alterações em `src/components/loja/ProductCard.tsx`:**
- Adicionar `useState` local para controlar abertura do modal.
- Tornar a `<img>` clicável (envolver em `<button>` com `cursor-pointer` e `aria-label`) → abre o modal.
- Renderizar o `<ProductDetailsModal>` controlado por esse estado.
- Manter o botão "Comprar" do card funcionando como hoje (atalho direto).

### Comportamento final
- Clicar na **imagem** → abre modal com detalhes completos.
- Clicar no botão **Comprar** (no card OU no modal) → abre o link de afiliado externamente (mesmo fluxo atual via `openExternalUrl`).
- Espaçamento superior do `/loja` igual ao das outras páginas internas.

### Arquivos afetados
- `src/pages/Loja.tsx` — ajuste de padding (1 linha)
- `src/components/loja/ProductCard.tsx` — adicionar trigger e estado do modal
- `src/components/loja/ProductDetailsModal.tsx` — novo arquivo