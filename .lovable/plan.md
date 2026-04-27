## Página Loja (/loja) + Admin (/admin/loja)

Loja de produtos de afiliado com categorias fixas, busca, carrosséis e CRUD de admin.

### 1. Banco de dados

Nova tabela `affiliate_products`:

```text
affiliate_products
- id              uuid pk
- name            text  (nome do produto)
- description     text  (opcional)
- image_url       text  (imagem do produto)
- storage_path    text  (path no bucket para deletar depois)
- affiliate_url   text  (link de afiliado)
- price           numeric (opcional)
- category        text  ('roupas' | 'beleza' | 'vitaminas')
- subcategory     text  (nullable; ex: 'feminino', 'masculino', 'maquiagem'...)
- is_active       boolean default true
- display_order   integer default 0
- created_at      timestamptz default now()
- updated_at      timestamptz default now()
```

**RLS**:
- SELECT: público quando `is_active = true` (qualquer usuário logado vê).
- INSERT/UPDATE/DELETE: só admin (`has_role(auth.uid(), 'admin')`).

**Storage**: novo bucket público `affiliate-products` para imagens.

### 2. Categorias e subcategorias (constantes no front)

```text
Roupas e Acessórios → Feminino, Masculino
Beleza → Beleza Premium, Dermocosméticos, Maquiagem, Perfumes, Cabelo, Rosto e Corpo
Vitaminas e Suplementos → (sem subcategorias)
```

Arquivo `src/data/storeCategories.ts` exporta esses valores como fonte única de verdade (usado pela loja, busca e admin).

### 3. Página /loja (`src/pages/Loja.tsx`)

Layout segue o padrão das outras páginas internas (header com voltar + título, fundo `bg-background`, `max-w-2xl`, `pb-24`, cards rosa #FFD1E7 `rounded-3xl shadow-xl`).

Estrutura vertical:

1. **Header** padrão (botão voltar + "Loja" + subtítulo "Produtos selecionados pra você").
2. **Card título da seção** (rosa, padrão do app).
3. **Buscador com filtros de categoria** (logo abaixo do card de título):
   - Input de busca por nome (ícone lupa).
   - Chips horizontais com scroll: "Todas", "Roupas e Acessórios", "Beleza", "Vitaminas e Suplementos".
   - Quando uma categoria com subcategorias estiver ativa, aparece uma segunda linha de chips com as subcategorias.
   - Ao buscar/filtrar, os carrosséis dão lugar a uma **grid de resultados** (2 colunas) com os produtos filtrados.
4. **Carrosséis** (quando não há busca/filtro ativo), nesta ordem:
   1. **Novidades** — últimos 10 produtos por `created_at desc`.
   2. **Vitaminas e Suplementos**
   3. **Beleza**
   4. **Roupas e Acessórios**

Cada carrossel: título + "Ver tudo" (aplica filtro de categoria) + Embla horizontal (`@/components/ui/carousel` já existente) com cards de produto.

**Card de produto** (componente `ProductCard`):
- Imagem quadrada `aspect-square rounded-2xl`.
- Nome (2 linhas máx).
- Preço (se houver).
- Botão "Comprar" rosa (cor primária) que **abre o link de afiliado em uma nova janela/aba externa** ao app:
  - Web: `window.open(affiliate_url, '_blank', 'noopener,noreferrer')`.
  - **iOS nativo (Capacitor)**: usar `@capacitor/browser` (`Browser.open({ url })`) para abrir no Safari in-app/externo, garantindo que **a navegação não aconteça dentro do WebView do app**. Detecção via `useNativePlatform` já existente. Se o plugin não estiver instalado, adicionar `@capacitor/browser` às deps e ao `cap sync`.

### 4. Página admin `/admin/loja` (`src/pages/AdminLoja.tsx`)

Mesma estrutura de `AdminBanners.tsx`:
- Verificação de role admin.
- Botão "Novo produto" abre dialog/modal (glassmorphism padrão `style/ui-modals`) com:
  - Upload de imagem (bucket `affiliate-products`).
  - Nome, descrição, preço (opcional), URL de afiliado.
  - Select de categoria (3 opções).
  - Select de subcategoria (aparece condicionalmente conforme categoria).
- Lista de produtos abaixo, agrupados por categoria, com:
  - Thumbnail, nome, categoria/subcategoria.
  - Botões editar e excluir (excluir remove imagem do storage também).

Adicionar card "Loja" no `AdminDashboard` com ícone `ShoppingBag`, apontando para `/admin/loja`.

### 5. Rotas (`src/App.tsx`)

```tsx
<Route path="/loja" element={<Loja />} />
<Route path="/admin/loja" element={<AdminLoja />} />
```

### 6. Acesso à loja pelo usuário

Adicionar item "Loja" no `moreSheetItems` da `tubelight-navbar` (ícone `ShoppingBag`), descrição "Produtos selecionados de parceiros".

### Fora do escopo
- Sistema de favoritos / wishlist.
- Tracking de cliques em afiliados.
- Importação em massa de produtos.
- Gateway de pagamento (são links externos).
