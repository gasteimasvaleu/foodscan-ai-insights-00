

## Corrigir o card de aviso sobre valores por 100g

### Problema
O card azul de aviso para múltiplos elementos diz "Os valores nutricionais são calculados com base em 100g de cada elemento", mas a IA agora estima o peso real de cada alimento (campo `estimated_weight`). O texto está desatualizado e confunde o usuário.

### Solução
Atualizar o texto do card informativo (linha 189-190 de `FoodNutritionResults.tsx`) para refletir que a IA já estimou os pesos automaticamente:

**Texto atual:**
> "Os valores nutricionais são calculados com base em 100g de cada elemento. Você pode ajustar as porções individuais no card abaixo para obter valores mais precisos."

**Novo texto:**
> "A IA identificou e estimou o peso de cada elemento do prato. Os valores nutricionais já estão calculados com base nos pesos estimados. Você pode ajustar as porções no card abaixo se necessário."

### Arquivo alterado
- `src/components/FoodNutritionResults.tsx` — linha 190, apenas texto do aviso

