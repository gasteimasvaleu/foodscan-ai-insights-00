

## Botão "Adicionar ao Controle Diário" no card de receita

### O que muda
No final do `HomeRecipeCard` (em `/faca-em-casa`), adicionar um botão rosa primário **"Adicionar ao Controle Diário"**. Ao tocar, abre um pequeno seletor de tipo de refeição (Café da Manhã / Lanche / Almoço / Jantar / Ceia) e insere a receita como uma entrada na tabela `meal_records`, exatamente no mesmo formato que o FoodScan já usa.

### Fluxo do usuário
1. Usuário gera a receita em `/faca-em-casa`.
2. Rola até o final do card e toca em **"Adicionar ao Controle Diário"**.
3. Aparece um Drawer (glassmorphism, padrão do app) com:
   - Tipo de refeição (`MealTypeSelector` reutilizado).
   - Resumo: nome, kcal, P/C/G por porção.
   - Botão "Confirmar".
4. Ao confirmar → `INSERT` em `meal_records` → toast de sucesso → opção "Ver Controle Diário" que navega para `/controle-diario`.

### Mapeamento de dados
A receita expõe valores como strings (`"750 kcal"`, `"45g"`). Vou extrair o número via regex (`parseFloat(match)`) e gravar **por porção** (dividindo pelo `recipe.porcoes`, que normalmente é número ou string como `"4 porções"`).

| Campo `meal_records` | Origem |
|---|---|
| `food_name` | `recipe.nome` + " (caseiro)" |
| `calories` | `nutri.calorias` (parseado) ÷ porções |
| `proteins` | `nutri.proteinas` (parseado) ÷ porções |
| `carbohydrates` | `nutri.carboidratos` (parseado) ÷ porções |
| `fats` | `nutri.gorduras` (parseado, fallback 0) ÷ porções |
| `portion` | "1 porção" |
| `meal_time` | `new Date().toISOString()` |
| `meal_type` | escolhido pelo usuário (default `almoco`) |
| `user_id` | `auth.uid()` |

### Arquivos afetados
- **`src/components/faca-em-casa/HomeRecipeCard.tsx`** — adicionar:
  - Estado local `showAddDrawer`, `mealType`, `isSaving`.
  - Função utilitária `parseNutriValue(str)` para extrair número de strings tipo `"750 kcal"`.
  - Botão rosa primário abaixo das seções existentes.
  - Drawer (`@/components/ui/drawer`) com `MealTypeSelector` + resumo + confirmar.
  - Insert em `supabase.from('meal_records')`.
  - Toast (`sonner`) de sucesso/erro com ação "Ver Controle Diário" via `useNavigate`.

### Sem mudanças de banco
A tabela `meal_records` já existe com RLS adequada. Nenhuma migration necessária.

### Observações
- Sem inputs de texto livres dentro do Drawer (alinhado às correções recentes do iOS).
- Se a receita não tiver `gorduras`, salva `0`.
- Se `porcoes` não puder ser parseado como número, assume `1` (grava valores totais).

