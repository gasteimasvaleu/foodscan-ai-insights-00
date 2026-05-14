Vou ajustar apenas o botão flutuante `+` da página `/comunidade`.

Plano:
1. Alterar a posição do botão de `right-4 bottom-28` para uma posição fixa no canto inferior direito que fique acima do Tubelight, mas mais afastada da área do campo/comentário.
2. Usar um deslocamento horizontal maior para a direita quando necessário, evitando que o círculo fique em cima do botão/campo de envio de comentário.
3. Manter o tamanho, cor e comportamento atuais do botão, sem alterar feed, comentários ou menu Tubelight.

Detalhe técnico:
- Arquivo alvo: `src/pages/Comunidade.tsx`
- Classe atual: `fixed right-4 bottom-28 ...`
- Ajuste provável: aumentar `right-*` e calibrar `bottom-*` para preservar espaço com o menu inferior e com o input de comentário.