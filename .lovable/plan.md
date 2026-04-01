

## Rollback completo: remover sono e frequência cardíaca do HealthKit

### Problema
O plugin `@capgo/capacitor-health` v8.4.2 não suporta `heart_rate` nem `sleep` como dataType. O código atual usa `'heart_rate' as any` e `'sleep' as any`, o que causa erro nativo e impede a conexão com o Apple Health.

### Alterações

**1. `src/hooks/useHealthKit.ts`**
- Remover interfaces `HeartRateData` e `SleepData`
- Remover estados `heartRate` e `sleepData`
- Remover funções `getHeartRate()` e `getSleepAnalysis()`
- Remover exports dessas funções/estados
- Manter apenas: steps, calories, weight, weeklyData, workouts

**2. `src/pages/AppleHealth.tsx`**
- Remover cards de frequência cardíaca e sono (linhas 368-403)
- Remover imports de `HeartRateData`, `SleepData`, `Moon`
- Remover destructuring de `heartRate` e `sleepData` do hook

Resultado: a autorização volta a pedir apenas `steps`, `calories`, `weight`, `workouts` (que já funcionava), e nenhuma chamada posterior usa tipos não suportados.

