## Lista de Compras — MVP

Nova funcionalidade que permite o usuário criar e gerenciar **várias listas de compras** para o mercado, com possibilidade de marcar itens como comprados e compartilhar a lista via WhatsApp.

---

## Fluxo do usuário

1. Acessa via **Menu Mais (+)** da Navbar → "Lista de Compras".
2. Vê index com cards de suas listas ("Compras da semana", "Festa", etc.) + botão "Nova lista".
3. Toca em uma lista → tela de detalhe com itens agrupados por categoria.
4. Adiciona itens (nome, quantidade, unidade, categoria).
5. Marca checkbox conforme compra; itens comprados ficam riscados e movem pro fim.
6. Botão "Compartilhar no WhatsApp" envia lista formatada.
7. Pode arquivar ou excluir listas antigas.

---

## Estrutura técnica

### Banco de dados (migration — 2 tabelas novas)

**`shopping_lists`**
- `id` uuid PK
- `user_id` uuid NOT NULL (RLS)
- `name` text NOT NULL
- `is_archived` boolean default false
- `created_at`, `updated_at` timestamptz

**`shopping_list_items`**
- `id` uuid PK
- `list_id` uuid NOT NULL (FK → shopping_lists, ON DELETE CASCADE)
- `user_id` uuid NOT NULL (RLS direta sem join)
- `name` text NOT NULL
- `quantity` numeric default 1
- `unit` text default 'un' (un, kg, g, L, ml, pct, dz)
- `category` text default 'outros'
- `is_purchased` boolean default false
- `display_order` int default 0
- `created_at`, `updated_at` timestamptz

**RLS**: ambas tabelas com policies `auth.uid() = user_id` para SELECT, INSERT, UPDATE, DELETE.

**Trigger**: `update_updated_at_column` em ambas (função já existe).

### Arquivos a criar

- `src/pages/ShoppingList.tsx` — index das listas (rota `/lista-de-compras`)
- `src/pages/ShoppingListDetail.tsx` — detalhe (rota `/lista-de-compras/:id`)
- `src/components/shopping/ShoppingListCard.tsx` — card rosa de cada lista no index
- `src/components/shopping/ShoppingItemRow.tsx` — linha de item com checkbox
- `src/components/shopping/AddItemModal.tsx` — modal glassmorphism para adicionar/editar item
- `src/components/shopping/CreateListModal.tsx` — modal para criar nova lista
- `src/data/shoppingCategories.ts` — catálogo de categorias (Hortifrúti, Carnes, Laticínios, Padaria, Bebidas, Limpeza, Higiene, Outros)
- `src/hooks/useShoppingLists.ts` — hook CRUD para listas e itens
- `src/lib/shoppingShare.ts` — formatador de mensagem WhatsApp

### Arquivos a editar

- `src/App.tsx` — adicionar 2 rotas novas + import dos componentes
- `src/components/ui/tubelight-navbar.tsx` (ou onde está o hub do botão Mais) — adicionar item "Lista de Compras" no menu Mais (+)

---

## Padrões visuais (alinhados ao app)

- Header compacto horizontal com gradiente, título `#FD46A1` (padrão page-headers)
- Container com `pt-[calc(env(safe-area-inset-top)+4rem)]` e `pb-28`
- Cards das listas: `bg-[#FFD1E7] rounded-3xl`, título `text-base` sem ícone
- Modais: glassmorphism (`bg-white/70 backdrop-blur-md`), botão X rosa `#FD46A1`
- Inputs com `text-base` (anti-zoom iOS)
- Itens agrupados por categoria com header sutil de seção
- Checkbox grande para uso fácil no mercado
- Contador no topo: "X de Y itens"

---

## Compartilhar via WhatsApp

Formato da mensagem:
```
🛒 Lista: Compras da semana

— Hortifrúti —
• 1kg de tomate
• 2un de alface

— Carnes —
• 500g de frango

(13 itens · 4 já comprados)
Enviado pelo We Diet 💗
```

Usa `openExternal` para abrir `whatsapp://send?text=...` (padrão do app, compatível com Capacitor).

---

## Pontos fora de escopo (MVP)

- Importar de receita do MasterCheFIT
- Autocompletar com histórico de meal_records
- Quick Action no Dashboard
- Cálculo de preço/orçamento
- Compartilhar lista entre usuários

Esses ficam pra v2 se você quiser depois.