## Objetivo

Na página `/alimentos`, substituir a faixa horizontal de "chips" de categorias por um **botão seletor** que abre um **Drawer** (padrão usado em `/loja`, `/receitas`, etc.), trazendo consistência visual com o resto do app.

## Mudanças em `src/pages/Alimentos.tsx`

1. **Remover** a `<div>` com `flex gap-2 overflow-x-auto` que renderiza os chips de `FOOD_CATEGORIES`.
2. **Adicionar** abaixo do campo de busca um botão único:
   - Estilo: `bg-[#FFD1E7] rounded-full px-4 py-2` com label "Categoria: {nome atual}" e ícone chevron à direita.
   - Mostra "Todas" quando nenhuma categoria está selecionada.
3. **Adicionar estado** `isCategoryDrawerOpen` e importar `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerFooter` de `@/components/ui/drawer`.
4. **Renderizar Drawer** seguindo o padrão de `Loja.tsx`:
   - `DrawerContent` com classes: `w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl px-4 pb-4 max-h-[75vh]`.
   - `DrawerHeader` com `DrawerTitle` "Escolha a categoria".
   - Lista vertical scrollável (`overflow-y-auto`) das `FOOD_CATEGORIES`, cada item como botão de largura cheia, `rounded-2xl`, com bg `#FD46A1` (texto branco) quando ativo e `#FFD1E7` quando inativo.
   - Ao clicar em uma categoria: `setCategory(value)` e `setIsCategoryDrawerOpen(false)`.
   - `DrawerFooter` com botão "Fechar" (`bg-[#FD46A1] text-white rounded-full`).

## Constraint respeitada

A página `/alimentos` não usa `Dialog` por trás (o `Dialog` de detalhes só abre depois que o usuário clica num alimento), então usar `Drawer` aqui não viola a regra de "não usar Drawers dentro de Dialogs".

## Resultado

- Menos poluição visual no topo da página.
- Consistência com `/loja`, `/receitas`, `/sleep`.
- Mais espaço para a lista de alimentos no viewport mobile (390x610).