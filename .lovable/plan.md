

## Traduzir modo de preparo das receitas

### Problema
O componente `RecipeDetails` exibe os passos do modo de preparo a partir de `recipe.analyzedInstructions[0].steps[].step`, mas a edge function só traduz `data.instructions` (texto HTML). Os steps estruturados nunca são traduzidos.

### Solução
Na edge function `spoonacular-recipes/index.ts`, adicionar tradução dos steps dentro de `analyzedInstructions` usando `translateBatch`.

### Mudança

**`supabase/functions/spoonacular-recipes/index.ts`** (action `details`, após traduzir ingredients):
- Extrair todos os `step.step` de `data.analyzedInstructions[0].steps`
- Traduzir em batch com `translateBatch`
- Substituir cada step pelo texto traduzido

```typescript
// After translating ingredients, add:
if (data.analyzedInstructions?.[0]?.steps?.length) {
  const steps = data.analyzedInstructions[0].steps;
  const stepTexts = steps.map((s: any) => s.step);
  const translatedSteps = await translateBatch(stepTexts, 'English', 'Portuguese', openaiKey);
  steps.forEach((s: any, i: number) => {
    s.originalStep = s.step;
    s.step = translatedSteps[i];
  });
}
```

Depois, redeploy da edge function.

