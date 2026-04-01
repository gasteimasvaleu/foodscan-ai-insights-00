

## Adicionar Sono e Frequência Cardíaca ao Apple Health

### O que será feito
Adicionar leitura de **sono** (sleep_analysis) e **frequência cardíaca** (heart_rate) do HealthKit, exibindo novos cards na página `/apple-health` e incluindo as permissões na autorização.

### Alterações

**1. Editar `src/hooks/useHealthKit.ts`**
- Adicionar `'sleep'` e `'heart_rate'` ao array `read` em `requestAuthorization`
- Criar estados: `heartRate` (repouso/média/máx), `sleepData` (duração da última noite, horários)
- Novo método `getHeartRate()`: usa `Health.queryAggregated` com `dataType: 'heart_rate'` para obter média e `Health.readSamples` para repouso
- Novo método `getSleepAnalysis()`: usa `Health.readSamples` com `dataType: 'sleep'` para buscar registros da última noite, calcular duração total
- Incluir ambos no `refreshData()`
- Exportar os novos estados e métodos

**2. Editar `src/pages/AppleHealth.tsx`**
- Adicionar dois novos cards após o grid de Calorias/Peso:
  - **Card Frequência Cardíaca**: ícone `Heart` vermelho, exibe BPM de repouso e média diária
  - **Card Sono**: ícone `Moon` azul-índigo, exibe duração do sono da última noite (ex: "7h 32min"), horário de dormir e acordar
- Ambos seguem o mesmo padrão visual dos cards existentes (`bg-card/80 backdrop-blur-xl rounded-2xl`)

**3. Editar `ios/App/App/Info.plist`**
- Já contém `NSHealthShareUsageDescription` — nenhuma alteração necessária (as permissões específicas são solicitadas via código)

### Detalhes técnicos
- O plugin `@capgo/capacitor-health` suporta `sleep` como dataType para `readSamples` e `heart_rate` para `queryAggregated`/`readSamples`
- Sono: filtrar amostras do tipo "asleep" (excluindo "inBed" e "awake") para calcular duração real
- Frequência cardíaca: usar agregação `avg` para média diária e sample mais recente com source "watch" para repouso
- Na web/preview, os dados mostrarão "—" (sem dados) já que o HealthKit só funciona no dispositivo nativo

