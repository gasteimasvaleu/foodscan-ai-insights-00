

## Integração Apple HealthKit com @capgo/capacitor-health

### Resumo
Integrar o plugin `@capgo/capacitor-health` para ler passos e calorias queimadas do Apple Health, e escrever calorias consumidas das refeições. O plugin é compatível com Capacitor 8 e CocoaPods (que o projeto já usa).

### Arquivos novos

**1. `src/hooks/useHealthKit.ts`**
Hook centralizado com:
- `isAvailable()` -- checa se HealthKit está disponível (retorna false na web)
- `requestPermissions()` -- solicita permissões de leitura (steps, calories, weight) e escrita (weight)
- `getDailySteps()` -- busca passos do dia atual
- `getDailyActiveCalories()` -- busca calorias queimadas do dia
- `getWeight()` -- busca peso mais recente
- `saveMealCalories(calories)` -- salva calorias da refeição no Health
- Estado: `isConnected`, `isLoading`, `dailySteps`, `dailyCalories`
- Usa `useNativePlatform` para verificar se está no iOS nativo

**2. `src/components/HealthKitConnect.tsx`**
Soft prompt (tela de pré-permissão) com visual WeDiet:
- Icone Apple Health + explicação dos benefícios
- "Sincronize automaticamente seus treinos do Apple Watch, Garmin e Strava"
- Botão "Conectar Apple Health"
- Aparece apenas no iOS nativo e se o usuário ainda não conectou (localStorage flag)
- Botão "Agora não" para dispensar

**3. `src/components/HealthKitDashboard.tsx`**
Card para o FitTracker Dashboard mostrando dados do HealthKit:
- Passos do dia (com ícone de caminhada)
- Calorias ativas queimadas
- Badge "Apple Health" indicando fonte dos dados
- Botão para reconectar/desconectar

### Arquivos modificados

**4. `package.json`**
- Adicionar `@capgo/capacitor-health: "^8.4.1"`

**5. `ios/App/App/Info.plist`**
- Adicionar `NSHealthShareUsageDescription` (leitura)
- Adicionar `NSHealthUpdateUsageDescription` (escrita)
- Textos em português explicando o benefício direto

**6. `ios/App/App/App.entitlements` + `AppDebug.entitlements` + `AppRelease.entitlements`**
- Adicionar entitlement `com.apple.developer.healthkit` (boolean true)
- Adicionar `com.apple.developer.healthkit.access` com array vazio

**7. `src/pages/FitTracker.tsx`**
- Importar `HealthKitConnect` e `HealthKitDashboard`
- Mostrar soft prompt na primeira visita (antes das tabs)
- Adicionar card de dados HealthKit no dashboard tab

**8. `src/components/NutritionResults.tsx`**
- Após salvar refeição com sucesso, chamar `saveMealCalories(calories)` do hook
- Toast adicional: "Calorias sincronizadas com Apple Health"
- Só executa se estiver no iOS nativo e conectado

### Passos manuais do usuário (após implementação)
1. `git pull` o projeto
2. `npm install`
3. `npx cap sync ios`
4. No Xcode: adicionar capability "HealthKit" no target App
5. No Apple Developer: habilitar HealthKit no App ID (se ainda não fez)
6. No Appflow: fazer upload do novo Provisioning Profile
7. Build e testar no dispositivo

### Detalhes técnicos

API do plugin:
```typescript
import { Health } from '@capgo/capacitor-health';

// Verificar disponibilidade
const { available } = await Health.isAvailable();

// Solicitar permissões
await Health.requestAuthorization({
  read: ['steps', 'calories', 'weight'],
  write: ['weight'],
});

// Ler dados
const { samples } = await Health.readSamples({
  dataType: 'steps',
  startDate: startOfDay.toISOString(),
  endDate: new Date().toISOString(),
});

// Escrever dados
await Health.saveSample({
  dataType: 'weight',
  value: 74.6,
  startDate: new Date().toISOString(),
});
```

Na web, `Health.isAvailable()` retorna `{ available: false }`, então todo o código graciosamente não executa sem erros.

