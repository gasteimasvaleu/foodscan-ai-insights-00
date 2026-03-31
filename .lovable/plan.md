

## Adicionar Tipo de Refeição ao FoodScan + Agrupamento no Controle Diário

### Resumo

Adicionar um seletor de tipo de refeição (Café da Manhã, Lanche, Almoço, Jantar, Ceia) antes do botão "Salvar Refeição" no FoodScan. No Controle Diário, agrupar as refeições por tipo no card "Refeições de Hoje".

### Plano

#### 1. Migration — adicionar coluna `meal_type` à tabela `meal_records`
- `ALTER TABLE meal_records ADD COLUMN meal_type text DEFAULT 'outro';`

#### 2. Criar componente `MealTypeSelector`
- Novo arquivo `src/components/MealTypeSelector.tsx`
- Switch/chips horizontais com as opções: ☕ Café da Manhã, 🍎 Lanche, 🍽️ Almoço, 🌙 Jantar, 🌜 Ceia
- Recebe `value` e `onChange` como props
- Reutiliza o padrão visual já existente no app (badges/botões arredondados com cor rosa)

#### 3. Integrar nos componentes de salvar refeição
- **`FoodNutritionResults.tsx`** — adicionar estado `mealType`, renderizar `<MealTypeSelector>` acima do botão "Salvar Refeição", incluir `meal_type` no insert
- **`NutritionResults.tsx`** — mesma integração

#### 4. Atualizar `MealRecord` interface
- Em `src/pages/DailyControl.tsx`, adicionar `meal_type?: string` à interface `MealRecord`

#### 5. Atualizar `MealsList` para agrupar por tipo
- Agrupar `meals` por `meal_type`
- Renderizar seções com header (emoji + nome do tipo) e os cards de cada refeição dentro
- Tipos sem refeições ficam ocultos
- Manter layout e cores atuais dos cards individuais

#### 6. Regenerar types do Supabase
- Atualizar `src/integrations/supabase/types.ts` para incluir `meal_type` na tabela `meal_records`

### Resultado
No FoodScan, o usuário escolhe o tipo de refeição antes de salvar. No Controle Diário, as refeições aparecem organizadas por seções (Café da Manhã, Almoço, etc.) em vez de uma lista flat.

