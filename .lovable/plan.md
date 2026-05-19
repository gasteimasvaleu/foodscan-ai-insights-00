## Corrigir corte de texto em imagens de Story (9:16)

O modelo Nano Banana às vezes posiciona o texto muito perto das bordas no formato vertical, fazendo com que letras fiquem cortadas. A correção é instruir o modelo de forma explícita no prompt.

### Mudança única: `supabase/functions/generate-social-image/index.ts`

Ajustar o `imagePrompt` para Stories/Reels com regras explícitas de margem segura e tamanho de texto:

- Reservar **margem segura de pelo menos 15%** em todas as bordas (especialmente topo e base, onde o Instagram coloca avatar, nome e barra de progresso).
- Texto principal **centralizado no terço central vertical** da imagem.
- **Máximo 4 palavras** no título (em vez de 6) e quebra em até 2 linhas curtas.
- Fonte grande, alto contraste, sem ultrapassar 80% da largura.
- Proibir expressamente texto colado nas bordas ou cortado.

Também reforçar para o tipo quadrado uma instrução leve de margem para consistência (não é o problema reportado, mas evita regressão).

### Fora do escopo
- Não mudar UI nem aspect ratio do preview (já está correto em `aspect-[9/16]`).
- Não mudar modelo nem dimensões; só o texto do prompt.
