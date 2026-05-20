## Objetivo

Ajustar o visual da página de DM (`/comunidade/dm/:id`) para alinhar com o padrão do chat do venue (Tô Aqui).

## Mudanças em `src/pages/DMThread.tsx`

1. **Background da página**: trocar `bg-background` por `bg-[#F7FAFB]` no container principal (linha 173), igual ao venue chat.

2. **Header (linha 175)**:
   - Trocar `bg-card` por `bg-white` para combinar com o header do venue.
   - Reorganizar a ordem dos itens: avatar + nome à esquerda, **seta voltar à direita** (em vez de à esquerda).
   - Nome do usuário (linha 186): cor `text-[#FD46A1]` em vez de `text-foreground`.
   - Botão voltar (linha 176): mover para o fim do flex; envolver a seta num botão arredondado rosa — `bg-[#FD46A1] text-white rounded-full h-9 w-9 flex items-center justify-center`, com `<ArrowLeft className="w-5 h-5" />` branco dentro.

## Fora de escopo
- Bolhas de mensagem, composer e demais elementos permanecem como estão.