

## Plano: Restringir Apple Health a steps/calories/weight/workouts

O `refreshData` atual chama `getHeartRate()` e `getSleepAnalysis()` junto com as demais funções. Esses tipos não estão na lista de autorização e podem causar falhas no bridge. Vamos remover essas chamadas do fluxo principal e manter apenas o que funcionava antes.

### Alterações no arquivo `src/hooks/useHealthKit.ts`

1. **Remover `getHeartRate()` e `getSleepAnalysis()` do `refreshData`** (linha 484-492) — manter apenas `getDailySteps`, `getDailyActiveCalories`, `getWeight`, `getWeeklyData`, `getRecentWorkouts`

2. **Remover as dependências de `getHeartRate` e `getSleepAnalysis` do array de deps do `refreshData`** (linha 496)

3. **Manter as funções `getHeartRate` e `getSleepAnalysis` no hook** — elas continuam disponíveis para uso oportunístico na página `/apple-health`, mas não são chamadas automaticamente no refresh principal

Nenhuma outra alteração necessária. O `requestPermissions` já solicita apenas `['steps', 'calories', 'weight', 'workouts']`, o que está correto.

