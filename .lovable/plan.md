

## Página Apple Health com Integração de Calorias no FitTracker

### Contexto
O FitTracker já puxa calorias queimadas da tabela `exercise_records` (Supabase). O `ChartsProgress` também usa essa tabela para o gráfico de balanço calórico (consumidas vs queimadas). As calorias do HealthKit (incluindo apps conectados como Strava) precisam ser **somadas** às calorias do Supabase nos dashboards e gráficos existentes.

### Plano

**1. Expandir `src/hooks/useHealthKit.ts`**
- Adicionar `getWeeklyData()` — busca passos e calorias dos últimos 7 dias via `queryAggregated` com `bucket: 'day'`, retorna array `{ date, steps, calories }`
- Adicionar `getRecentWorkouts()` — busca workouts via `readSamples({ dataType: 'workout' })` dos últimos 7 dias, retornando `sourceName`, duração, tipo, data
- Novos estados: `weeklyData`, `recentWorkouts`

**2. Criar `src/pages/AppleHealth.tsx`**
- Header Apple Health com badge de status
- Se desconectado: `HealthKitConnect` prompt
- Se conectado:
  - Card **Passos hoje** com barra de progresso (meta 10k)
  - Card **Calorias ativas** (do HealthKit)
  - Card **Peso mais recente**
  - Card **Histórico semanal** — barras CSS dos últimos 7 dias (passos + calorias)
  - Card **Atividades de Apps Conectados** — lista workouts recentes com `sourceName` (Strava laranja, Garmin azul, Apple Watch verde, fallback rosa)
- Protegida por auth

**3. Integrar calorias HealthKit no `ExerciseDashboard`**
- Receber `dailyCalories` do HealthKit via props
- Somar ao `todayCalories` do Supabase, exibindo o total combinado
- Adicionar indicador visual mostrando "X do app + Y do Apple Health"

**4. Integrar calorias HealthKit no `ChartsProgress`**
- Na função `loadCalorieBalance`, quando HealthKit estiver conectado, buscar `weeklyData` do hook e somar as calorias HealthKit por dia ao `burned` do `balanceMap`
- O gráfico de balanço calórico passa a refletir calorias de exercícios manuais + HealthKit (Strava, etc.)

**5. Adicionar rota e navegação**
- `src/App.tsx`: rota `/apple-health`
- `src/pages/FitTracker.tsx`: botão "Ver detalhes" no `HealthKitDashboard` que navega para `/apple-health`
- `src/components/Navbar.tsx`: considerar link no menu (se aplicável)

### Fluxo de dados
```text
Strava/Garmin → Apple Health → useHealthKit hook
                                    ↓
                    ┌───────────────┼───────────────┐
                    ↓               ↓               ↓
              AppleHealth      ExerciseDashboard  ChartsProgress
              (página nova)    (today calories    (gráfico balanço
                                += HK calories)    += HK calories)
```

### Arquivos envolvidos
- `src/hooks/useHealthKit.ts` — expandir com weeklyData e recentWorkouts
- `src/pages/AppleHealth.tsx` — criar página nova
- `src/components/ExerciseDashboard.tsx` — receber e somar calorias HK
- `src/pages/ChartsProgress.tsx` — somar calorias HK no gráfico
- `src/pages/FitTracker.tsx` — passar dados HK ao dashboard, adicionar link
- `src/App.tsx` — nova rota

