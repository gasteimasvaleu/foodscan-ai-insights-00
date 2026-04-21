

## Página "Faça em Casa" — Identificação de pratos por foto + Receita caseira com IA

Nova página `/faca-em-casa` que recebe uma foto de prato (inclusive fast-food), identifica via IA e gera uma receita caseira completa, com fluxo de desambiguação quando há múltiplos candidatos. Adequado ao stack atual: Lovable AI Gateway (já tem `LOVABLE_API_KEY`), padrão visual rosa/glassmorphism do app, navegação interna existente, autenticação `useAuth` já pronta.

### 1. Rota e navegação
- Adicionar rota `<Route path="/faca-em-casa" element={<FacaEmCasa />} />` em `src/App.tsx`.
- Adicionar atalho dentro do bottom-sheet "+" do `TubelightNavbar` (menu "Mais") com ícone `ChefHat` ou `Camera`, conforme padrão de `mem://features/navigation/bottom-plus-menu`. Sem novo item fixo na barra para não saturar.
- Página protegida: se `!user` → `<AuthCard />`, igual `/receitas`.

### 2. Tabela `recipes` (histórico)
Migration:
```sql
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  nome text not null,
  recipe_data jsonb not null,
  image_url text,
  created_at timestamptz not null default now()
);
alter table public.recipes enable row level security;
create policy "Users view own recipes" on public.recipes for select using (auth.uid() = user_id);
create policy "Users insert own recipes" on public.recipes for insert with check (auth.uid() = user_id);
create policy "Users delete own recipes" on public.recipes for delete using (auth.uid() = user_id);
create index recipes_user_created_idx on public.recipes (user_id, created_at desc);
```
Sem FK para `auth.users` (padrão do projeto).

### 3. Edge Functions (Lovable AI Gateway, modelo `google/gemini-2.5-flash`)

**`supabase/functions/identify-dish/index.ts`** (`verify_jwt = false`)
- Input: `{ imageBase64 }`.
- Chama `https://ai.gateway.lovable.dev/v1/chat/completions` com a imagem como `image_url` data URL.
- System prompt em PT-BR força JSON estrito, retornando um destes 3 formatos:
  - `{ error: "not_food", message }` se não for comida.
  - Receita única (`Recipe` completo) quando confiança ≥ 85%.
  - `{ type: "multiple_options", message, options: FastFoodOption[] }` (3–5 candidatos) para pratos ambíguos / fast-food genérico.
- Trata 429 → "Muitas requisições, tente em instantes"; 402 → toast pedindo créditos no workspace; demais erros mapeados.

**`supabase/functions/generate-home-recipe/index.ts`** (`verify_jwt = false`)
- Input: `{ imageBase64, selectedOption: FastFoodOption }`.
- Gera `Recipe` completo da opção escolhida, sempre com `comparativoNutricional` e `versaoCaseira` preenchidos quando for fast-food.

Ambas adicionadas ao `supabase/config.toml`.

### 4. Tipos `src/types/recipe.ts`
Conforme o prompt original (Recipe, Ingredient, NutritionalInfo, ComparativoNutricional, VersaoCaseira, FastFoodOption, MultipleOptionsResponse, RecipeError, RecipeResponse). Mantém union para o hook tratar.

### 5. Componentes novos (`src/components/faca-em-casa/`)
- `DishImageUpload.tsx` — dropzone + input com `capture="environment"` no mobile. Reaproveita estilo do `ImageUpload.tsx` existente (card pontilhado, ícone, botão).
- `AnalysisProgress.tsx` — 3 etapas animadas: "Enviando imagem" → "Identificando prato" → "Gerando receita". Usa `VideoOverlay` global como fallback se preferir, mas dedicado dá feedback de progresso.
- `FastFoodSelector.tsx` — grid de cards (rosa primário, padrão `mem://style/ui-cards`) com nome, rede, badge de confiança (%), descrição. Click chama `selectOption`.
- `HomeRecipeCard.tsx` — receita completa: nome, descrição, ingredientes, modo de preparo, tempo, dificuldade, porções, dicas, variações, nutrição, e bloco "Versão Caseira vs Original" (comparativo + benefícios + economia).
- `ShareRecipe.tsx` — Web Share API com fallback para copiar texto formatado (sonner toast).

### 6. Hook `src/hooks/useDishRecipe.ts`
Estado `{ recipe, options, isLoading, step, error }` + métodos:
- `analyzeImage(file)` — comprime via `lib/imageCompression.ts` (max 1200px, JPEG 0.85), converte para base64 e chama `supabase.functions.invoke('identify-dish', ...)`.
- `selectOption(option)` — chama `generate-home-recipe`.
- `saveRecipe()` — insere em `public.recipes` (requer login).
- `reset()`.

`src/lib/imageCompression.ts` — utilitário canvas, retorna base64 sem prefixo `data:`.

### 7. Página `src/pages/FacaEmCasa.tsx`
Layout no padrão das outras páginas internas:
- `Navbar` + container `max-w-lg` com `pt-[calc(env(safe-area-inset-top)+4rem)]` e `pb-32`.
- Header glassmorphism rosa idêntico ao de `/receitas` com ícone `ChefHat` e título "Faça em Casa".
- Subtítulo curto: "Tire uma foto do prato e receba a receita caseira."
- Estados renderizados condicionalmente: upload → progress → (selector ou receita) → ações (Salvar / Compartilhar / Nova foto).
- Botão "Histórico de receitas" abre `Drawer` listando `recipes` do usuário (consulta direta no client) com excluir (RLS já cobre).

### 8. Tema
Manter paleta atual do app (rosa primário + glassmorphism). **Não** sobrescrever `--primary` para vermelho/amarelo conforme o prompt original — isso quebraria a identidade visual existente (`mem://style/color-palette`, `mem://style/branding`). Cards de fast-food usam acentos quentes pontuais (badges/ícones) sem alterar tokens globais.

### 9. Detalhes técnicos
- Toda comunicação IA via edge function (nunca direto do client).
- Prompt PT-BR, resposta JSON estrita (extrair `choices[0].message.content`, `JSON.parse` com try/catch e fallback de erro amigável).
- Compressão client-side antes do upload para reduzir payload.
- iOS: `<input capture="environment">` para câmera; toda estética respeita safe-area, sem inputs de texto livres dentro de Drawers (alinhado às correções recentes do iOS).
- Sem armazenar imagem em Storage nesta v1 (`image_url` fica `null`); pode-se adicionar bucket depois se desejado.

### 10. Itens explicitamente fora desta v1
- Página `/auth` separada (já existe).
- Página `/history` separada (substituída por Drawer dentro de `/faca-em-casa`).
- Mudança de tema/cores globais.
- Upload da foto original para Storage (deixado para iteração futura).

