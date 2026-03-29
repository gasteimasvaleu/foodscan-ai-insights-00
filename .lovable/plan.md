

## Incluir calorias do Apple Health no card "Últimos 7 Dias"

### Problema
O card "Hoje" soma `stats.todayCalories + healthKitCalories`, mas o card "Últimos 7 Dias" exibe apenas `stats.weeklyCalories` (somente do Supabase), ignorando as calorias do HealthKit.

### Solução
O hook `useHealthKit` já retorna `weeklyData` (array com calorias diárias do HealthKit dos últimos 7 dias). Basta:

1. **`src/pages/FitTracker.tsx`** — passar `weeklyData` do useHealthKit como prop para `ExerciseDashboard`
2. **`src/components/ExerciseDashboard.tsx`**:
   - Adicionar prop `healthKitWeeklyData` (array de `WeeklyDataPoint`)
   - Calcular `healthKitWeeklyCalories` somando as calorias do array
   - Exibir `stats.weeklyCalories + healthKitWeeklyCalories` no card "Últimos 7 Dias"
   - Mostrar detalhe "X app + Y Apple Health" como já faz no card "Hoje"

