## Remover texto das imagens geradas

A IA de geração de imagem não escreve bem em português brasileiro (erros de ortografia, letras cortadas, palavras inventadas). Vamos pedir explicitamente imagens **sem nenhum texto**, deixando o texto só na legenda do post.

### Mudança única: `supabase/functions/generate-social-image/index.ts`

Reescrever o `imagePrompt` para:
- Instruir composição puramente visual (foco no alimento, ingredientes, ambiente, mood).
- Adicionar regra explícita: **"SEM TEXTO, sem letras, sem palavras, sem números, sem logos, sem marcas d'água"** — repetida no final como reforço.
- Manter a regra de orientação (vertical 9:16 para story/reel, quadrada 1:1 para os demais) e margens seguras para o enquadramento do Instagram.
- Remover o bloco que mencionava "máximo X palavras", "fonte bold", "alto contraste de texto", etc.

### Fora do escopo
- Não muda a UI nem a legenda gerada (essa continua em português, gerada por modelo de texto que escreve bem).
- Não muda outras edge functions.
