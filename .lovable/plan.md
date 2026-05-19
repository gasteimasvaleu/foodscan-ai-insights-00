## Ajustes no "Nutricionista que Vende"

### 1. Formato de imagem por tipo de post

Hoje `generate-social-image` gera sempre 1080x1080 (quadrado). Vamos passar o `post_type` para definir a proporção:

- `story` e `reel` → **1080x1920 (9:16)**
- demais tipos (`dica`, `carrossel`, `receita`, `antes_depois`) → **1080x1080 (1:1)**

Mudanças:
- **`supabase/functions/generate-social-image/index.ts`**: ajustar o prompt para informar a proporção correta ("Imagem vertical 1080x1920 (9:16) para Story/Reel" vs "Imagem quadrada 1080x1080 (1:1)"). Salvar a proporção retornada junto (`aspect_ratio`).
- **`PostResultCard.tsx`**: o preview hoje é `aspect-square` fixo. Trocar para `aspect-[9/16]` quando o tipo for `story`/`reel`, senão `aspect-square`. Receberá uma prop opcional `postType`.
- **`NutricionistaQueVende.tsx`**: passar `form.post_type` para o `PostResultCard`.

> Observação: o modelo Nano Banana nem sempre respeita exatamente as dimensões pedidas; o prompt vai reforçar "vertical 9:16, sem cortar elementos importantes". O container do preview garante o enquadramento visual correto independente do que o modelo retornar.

### 2. Botão "Gerar receita com IA" quando o post for de receita

Quando `post_type === "receita"`, mostrar no `PostResultCard` (logo abaixo da legenda) um botão extra **"Gerar receita completa com IA"**.

Comportamento:
- Chama uma nova edge function **`generate-post-recipe`** que recebe `{ theme, audience }` e retorna `{ title, ingredients: string[], steps: string[], tips?: string, macros?: { kcal, protein, carbs, fat } }` via tool calling (`google/gemini-2.5-flash`).
- O resultado aparece em um card expansível dentro do `PostResultCard` (sem sair da página), com botões **Copiar receita** e **Adicionar à legenda** (concatena a receita formatada ao final do `caption`).
- A receita gerada **não** é salva em tabela nova — fica apenas no estado local; se o usuário clicar "Adicionar à legenda" + "Salvar", ela entra no campo `caption` do `generated_posts` já existente.

Mudanças:
- Nova função **`supabase/functions/generate-post-recipe/index.ts`** (estrutura idêntica às outras: CORS, valida JWT, usa `LOVABLE_API_KEY`, retorna 429/402).
- Atualizar **`supabase/config.toml`** adicionando a função.
- **`PostResultCard.tsx`**: novo bloco condicional (`postType === "receita"`) com botão de IA, estado local `recipe`, `loadingRecipe`, e card de exibição.
- **`NutricionistaQueVende.tsx`**: passar `postType={form.post_type}` para o card.

### Fora do escopo

- Não muda schema do banco (`generated_posts` continua igual).
- Não cria tipo separado de "receita salva" (já existe `useUserRecipes` para isso; aqui é só conteúdo do post).
- Bucket `social-posts` continua o mesmo (aceita qualquer dimensão).
