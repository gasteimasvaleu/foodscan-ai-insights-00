

## Usar estimativa de porção da IA no app (elemento único + múltiplos)

### Problema atual
- A IA já retorna `quantity` (ex: "1 prato médio ~350g"), mas o app ignora e começa com 100g
- Para múltiplos elementos, o prompt pede nutrição por 100g de cada, sem estimativa de gramas por elemento

### Correção em 3 partes

**1. Edge function `analyze-nutrition` — atualizar prompt de múltiplos elementos**
- Adicionar campo `estimated_grams` em cada elemento do JSON
- Prompt passa a pedir: para cada elemento, estime os gramas visíveis no prato (ex: arroz ~150g, feijão ~100g, carne ~120g)
- Manter nutrição por 100g para permitir ajuste manual

Exemplo do JSON esperado:
```text
"elements": [
  {
    "name": "Arroz Branco",
    "estimated_grams": 150,
    "nutrition": { ... por 100g ... }
  }
]
```

**2. `src/components/FoodNutritionResults.tsx`**
- Para elemento único: extrair gramas do `data.quantity` (regex para número + "g") e usar como `portionGrams` inicial
- Para múltiplos elementos: inicializar `elementPortions` com `estimated_grams` de cada elemento ao invés de 100g fixo

**3. `src/components/PortionSelector.tsx`**
- Aceitar props `initialGrams` para pré-popular o campo com a estimativa da IA
- Usuário ainda pode ajustar manualmente

### Resultado
- App mostra estimativa de porção da IA igual ao WhatsApp, tanto para prato único quanto composto
- Valores nutricionais iniciam calculados para a porção estimada visualmente

