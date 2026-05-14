## Ajustar posição do botão flutuante "+" em /comunidade

**Problema**: o botão `+` está em `bottom-24` (6rem) e sobrepõe o campo "Escreva um comentário..." dos posts.

**Mudança**: em `src/pages/Comunidade.tsx` linha 167, trocar `bottom-24` por `bottom-20` para descer o botão ~1rem, mantendo-o acima da barra de navegação inferior sem cobrir o input de comentário.

Nenhuma outra alteração.