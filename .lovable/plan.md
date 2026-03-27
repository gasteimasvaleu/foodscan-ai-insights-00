

## Remover badges/indicadores de debug do FitTracker

### Mudanças

**1. `src/pages/FitTracker.tsx`** (linhas 102-105):
- Remover o bloco "Debug build marker" que mostra `Build: 2026-03-27T-DEBUG-V1 | HK: {debugStatus}`

**2. `src/components/HealthKitConnect.tsx`** (linhas 116-121):
- Remover o bloco "Debug status visible on screen" que mostra o `displayStatus` em mono
- Remover a variável `displayStatus` (linha ~82) e a prop `debugStatus` do uso interno (manter a prop na interface para não quebrar quem passa, mas não exibir nada)

**3. `src/hooks/useHealthKit.ts`** (linha 6):
- Aumentar timeout do `requestAuthorization` de 20s para 60s (pendente do plano anterior aprovado)

### O que NÃO será alterado
- Nenhuma lógica de conexão, permissão ou dados
- Nenhum arquivo de configuração (Podfile, entitlements, etc.)
- Os `console.log` internos permanecem (úteis para Xcode, invisíveis ao usuário)

