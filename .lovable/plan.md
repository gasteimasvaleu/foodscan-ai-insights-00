

## Incluir calorias do Apple Health no card "Calorias" das Estatísticas Gerais

### Problema
A função `loadStats` (linha 69) calcula `totalCaloriesBurned` somando apenas os registros do Supabase (`exercise_records`). As calorias do Apple Health não são incluídas, embora o gráfico de Balanço Calórico já as considere.

### Solução

**`src/pages/ChartsProgress.tsx`**:
1. Na função `loadStats`, após calcular `totalCaloriesBurned` do Supabase, verificar se `hkConnected` e chamar `getHKWeeklyData()` para obter as calorias do HealthKit
2. Somar `hkData.reduce((sum, d) => sum + d.calories, 0)` ao `totalCaloriesBurned`
3. Isso fará o card "Calorias" nas Estatísticas Gerais refletir o total combinado (app + Apple Health)

Alteração concentrada nas linhas 69-86 do arquivo.

