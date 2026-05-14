Adicionar um botão de grade (ícone Grid) no header da página `/comunidade`, à esquerda do botão de avião (DM). Ao ativá-lo, o feed e os Stories são substituídos por uma grade estilo Instagram com **as publicações do próprio usuário logado**. Clicar em uma célula abre o post completo (com curtidas, comentários e descrição).

## Comportamento

- Estado `view: 'feed' | 'grid'` em `Comunidade.tsx` (default: `feed`).
- Botão grade: ícone `LayoutGrid` (lucide). Ativo = fundo `#FD46A1` + ícone branco; inativo = ícone `text-foreground`.
- Quando `view === 'grid'`:
  - Esconder `StoriesCarousel` e a lista de `PostCard`.
  - Renderizar `<MyPostsGrid userId={user.id} onOpenPost={...} />`.
- Botão DM (avião) e botão flutuante "+" continuam funcionando normalmente.

## Grade (`MyPostsGrid`)

- Novo componente em `src/components/community/MyPostsGrid.tsx`.
- Query: `community_posts` filtrando por `user_id = currentUser`, ordem `created_at desc`, com `before_photo_url` não nulo.
- Layout: `grid grid-cols-3 gap-1`, cada célula `aspect-square`, `object-cover`, sem bordas — visual Instagram.
- Empty state: "Você ainda não publicou nada" (mesmo padrão visual do empty atual).
- Loading: spinner pequeno centralizado.

## Abrir post completo

- Novo componente `PostDetailModal` (`src/components/community/PostDetailModal.tsx`) usando `Dialog` com glassmorphism (bg-white/70, backdrop-blur-md, rounded-2xl).
- Reutiliza `PostCard` internamente passando os mesmos props (post, userId, userLiked, callbacks).
- Estado em `Comunidade.tsx`: `selectedPostId: string | null`. Ao fechar, atualiza likes/comments via `fetchPosts` opcional.

## Detalhes técnicos

- Não muda nada de backend / RLS — `community_posts` já é select-able.
- Não toca em `PostCard.tsx` exceto se necessário (idealmente reusar como está).
- Mantém `pt-[calc(env(safe-area-inset-top)+2.5rem)]` e demais constraints.
- Cores via tokens existentes; `#FD46A1` mantido para coerência visual com o resto do app.

## Arquivos

- `src/pages/Comunidade.tsx` — adicionar botão Grid + estado `view` + render condicional + modal.
- `src/components/community/MyPostsGrid.tsx` — novo.
- `src/components/community/PostDetailModal.tsx` — novo.
