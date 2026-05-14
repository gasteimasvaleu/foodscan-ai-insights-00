## Objetivo
Remover a faixa preta superior do `StoryViewer` e fazer com que as barras de progresso, avatar, nome, botões (lixeira/X) fiquem **sobrepostos** ao vídeo/imagem em fullscreen, igual ao Instagram Stories.

## Mudanças em `src/components/community/StoryViewer.tsx`

1. **Layout**: trocar o `flex flex-col` que empilha header + mídia por uma estrutura onde a mídia ocupa a tela toda (`absolute inset-0`) e header + barras ficam `absolute top-0` por cima.
2. **Mídia**: container vira `absolute inset-0` com `object-cover` (ou `object-contain` mantido, mas com `bg-black` atrás) ocupando 100% da viewport.
3. **Header overlay**:
   - `absolute top-0 left-0 right-0 z-20`
   - Mantém o `pt-[calc(env(safe-area-inset-top)+0.5rem)]` para não colidir com notch/Dynamic Island
   - Adicionar gradiente sutil `bg-gradient-to-b from-black/60 to-transparent` para garantir legibilidade dos textos brancos sobre qualquer cor de vídeo
   - Inclui as barras de progresso + linha do avatar/nome/botões
4. **Footer (reply)**: também vira overlay `absolute bottom-0` com gradiente `from-black/60 to-transparent` invertido, mantendo `pb-[calc(env(safe-area-inset-bottom)+0.75rem)]`.
5. **Tap zones (prev/next)**: continuam funcionando, ajustar `z-index` para ficar abaixo do header/footer mas acima da mídia.
6. **Container raiz**: `fixed inset-0 z-[100] bg-black overflow-hidden` (sem `flex flex-col`).

## Fora do escopo
- Mudanças em `CreateStoryModal`, `CreatePostModal`, `PostCard` ou `FeedVideo`.
- Lógica de progresso, mute, reply ou navegação — apenas reorganização visual.
