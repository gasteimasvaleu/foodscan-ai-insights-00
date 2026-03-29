

## Corrigir leitura de treinos do Strava (sem quebrar conexão existente)

### Garantia de compatibilidade
- Permissões existentes (`steps`, `calories`, `weight`) não são alteradas
- Apenas **adiciona** `'workouts'` ao array `read` — iOS preserva autorizações anteriores
- Funções `getDailySteps`, `getDailyActiveCalories`, `getWeight` permanecem intactas

### Alterações em `src/hooks/useHealthKit.ts`

**1. requestPermissions** — adicionar `'workouts'` ao read:
```ts
read: ['steps', 'calories', 'weight', 'workouts'],
```

**2. getRecentWorkouts** — trocar `Health.readSamples({ dataType: 'workout' as any })` por `Health.queryWorkouts()`:
```ts
const result = await Health.queryWorkouts({
  startDate: sevenDaysAgo.toISOString(),
  endDate: now.toISOString(),
  limit: 20,
});
```

**3. Adaptar mapeamento** dos campos retornados por `queryWorkouts()` na interface `RecentWorkout`.

### Ação do usuário após deploy
- Desconectar e reconectar o HealthKit no app para que o iOS solicite a permissão de leitura de treinos

