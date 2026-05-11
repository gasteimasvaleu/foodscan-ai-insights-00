## Problema

As edge functions da página `/faca-em-casa` (`identify-dish` e `generate-home-recipe`) ainda usam o padrão antigo, igual ao que quebrou no FoodScan. Dois pontos críticos:

1. **`identify-dish`** importa `@supabase/supabase-js@2.45.0`, mas a quota iOS chama `userClient.auth.getClaims(token)`, que só existe a partir da versão **2.57+**. No FoodScan isso causava `TypeError: userClient.auth.getClaims is not a function` para usuários iOS nativos free, e foi corrigido subindo para `2.57.4`.
2. Ambas funções fazem **`JSON.parse` ingênuo** do retorno da IA. Quando o modelo (Gemini) devolve JSON válido seguido de qualquer texto extra (explicação, espaço, comentário), a chamada quebra com `SyntaxError: Unexpected non-whitespace character after JSON…` — exatamente o sintoma que o FoodScan corrigiu com o parser tolerante (extrai o primeiro objeto JSON balanceado).

## Correção (frontend não muda)

### `supabase/functions/identify-dish/index.ts`
- Trocar import: `@supabase/supabase-js@2.45.0` → `@supabase/supabase-js@2.57.4`.
- Substituir `JSON.parse(cleaned)` pelo mesmo parser tolerante usado em `analyze-nutrition`:
  - Tentar `JSON.parse` direto.
  - Se falhar, varrer a string respeitando aspas/escape e extrair o **primeiro objeto `{…}` balanceado**, depois fazer parse só desse trecho.
- Manter o resto (quota, prompt, modelo `google/gemini-2.5-flash`, CORS) inalterado.

### `supabase/functions/generate-home-recipe/index.ts`
- Aplicar o mesmo parser tolerante em volta de `JSON.parse(cleaned)`.
- (Não usa supabase-js, então a versão não é problema aqui.)

### Sem mudanças
- Frontend (`useDishRecipe`, `FacaEmCasa.tsx`, componentes) permanece igual — o contrato de resposta não muda.
- Nenhuma alteração de banco, secrets ou config.toml.

## Resultado esperado
- Quota free no iOS volta a funcionar em `identify-dish`.
- Respostas com texto extra do Gemini deixam de quebrar — o JSON é extraído de forma tolerante, igual ao FoodScan.