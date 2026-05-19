## Objetivo

Ao clicar em um card de post (na lista do dia, na aba "Meus posts" de `/nutricionista-que-vende`), abrir um modal padrão do app com a imagem ampliada e todas as informações geradas (tema, tipo, data/hora, legenda, CTA, hashtags) e as ações já existentes (Copiar, Baixar, Excluir).

## Mudanças

### 1. `src/components/nutri-sells/PostHistoryGrid.tsx`
- Adicionar estado `openPost: GeneratedPost | null`.
- Envolver o conteúdo do item da lista do dia em um `<button>` (toda a área clicável) que faz `setOpenPost(p)`. Manter os botões de ação (Copiar/Baixar/Excluir) dentro do mesmo item, mas com `onClick` que chama `e.stopPropagation()` para não disparar o modal.
- Renderizar `<PostDetailModal post={openPost} onOpenChange={(o) => !o && setOpenPost(null)} onDelete={(id) => { onDelete(id); setOpenPost(null); }} />` no fim do componente.

### 2. Novo arquivo `src/components/nutri-sells/PostDetailModal.tsx`
- `Dialog` do shadcn com `DialogContent` no padrão do app: `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border border-[#FD46A1]/30 shadow-xl max-h-[85vh] overflow-y-auto`.
- Conteúdo:
  - `DialogHeader` com `DialogTitle` exibindo o tema (`text-base`, sem ícone), e logo abaixo a meta linha `{format(created_at, "d 'de' MMMM • HH:mm")} • {post_type}` em `text-xs text-muted-foreground`.
  - Imagem do post: bloco com `bg-[#FFD1E7]/30 border border-[#FD46A1]/15 rounded-xl overflow-hidden`. Se `post_type` for `story` ou `reel`, usar `aspect-[9/16] max-w-[260px] mx-auto`; senão `aspect-square`. Placeholder com ícone se não tiver imagem.
  - Bloco da legenda (mesmo sub-card claro `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-3`): caption (`whitespace-pre-wrap text-sm`), CTA em `text-sm font-medium text-[#FD46A1]`, hashtags em `text-xs text-muted-foreground break-words`.
  - Grade 2 colunas de botões: `Copiar legenda` (variant outline) e `Baixar imagem` (variant outline; desabilitado sem imagem) — reaproveitar helpers `copyToClipboard` e `downloadImage` de `@/lib/socialShare`.
  - Botão `Excluir` (variant ghost, `text-destructive`, full width) que chama `onDelete(post.id)`.
- Botão de fechar nativo do Radix: aplicar override visual via Core memory ("Close buttons use #FD46A1 bg") — `DialogContent` do projeto já estiliza o `X`; manter como vier do `ui/dialog`.

### 3. Fora de escopo
- Sem alterar `useGeneratedPosts`, sem alterar o calendário, sem alterar a geração de posts.
- Sem novas tabelas/edge functions.

## Validação

- No preview mobile (390px), abrir aba "Meus posts", tocar em um post na lista do dia: modal abre centralizado, com imagem 9:16 para story/reel ou quadrada para os demais, legenda/CTA/hashtags legíveis, e ações de copiar/baixar/excluir funcionando.