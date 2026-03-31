

## Estimativa de peso na análise + inputs pré-preenchidos

### Resumo

Três camadas de mudança: prompts da edge function, tipo TypeScript, e dois componentes frontend.

### 1. Edge function `analyze-nutrition` -- Prompt do Passo 1 (imagem)

Adicionar ao prompt do GPT-4o a instrução para estimar peso em gramas de cada alimento. O formato da descrição passa a incluir `(~Xg)` ao lado de cada item:

> "**Arroz Branco** (~150g): Grãos soltos e bem cozidos..."

### 2. Edge function `analyze-nutrition` -- Prompt do Passo 2 (nutricional)

- Instruir o GPT-4.1 a **usar os pesos estimados** da descrição para calcular os valores nutricionais (em vez de 100g genérico)
- Adicionar campo `estimated_weight` em cada elemento do JSON de resposta
- Os valores de `nutrition` de cada elemento continuam **por 100g** (para o seletor de porção funcionar), mas o peso estimado vem separado

### 3. Tipo `FoodElement` em `src/types/nutrition.ts`

Adicionar campo opcional:
```typescript
estimated_weight?: number; // peso estimado em gramas pela IA
```

### 4. `FoodNutritionResults.tsx` -- Inicializar porções com peso estimado

Alterar o `useEffect` (linhas 33-42) que inicializa `elementPortions` para usar `element.estimated_weight` em vez de 100g fixo:

```typescript
grams: element.estimated_weight || 100
```

### 5. `MultipleElementsPortionSelector.tsx` -- Receber peso inicial dos elementos

Alterar o `useState` inicial (linha 67-71) para usar o `estimated_weight` de cada elemento como valor default em vez de 100g. Mostrar o peso estimado no placeholder do input.

### 6. `FoodScan.tsx` -- Extrair `estimated_weight` dos elementos

No `extractElements` (linhas 268-351), incluir `estimated_weight` ao mapear cada elemento da resposta da IA.

### Arquivos editados

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/analyze-nutrition/index.ts` | Dois prompts de texto |
| `src/types/nutrition.ts` | +1 campo opcional |
| `src/components/FoodNutritionResults.tsx` | useEffect usa estimated_weight |
| `src/components/MultipleElementsPortionSelector.tsx` | Estado inicial usa estimated_weight |
| `src/pages/FoodScan.tsx` | extractElements inclui estimated_weight |

### Risco

Baixo. Os prompts são texto, o campo é opcional com fallback para 100g, e a estrutura JSON de resposta não quebra.

