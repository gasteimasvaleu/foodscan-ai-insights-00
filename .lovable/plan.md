
Objetivo: corrigir o travamento do fluxo Apple Health sem mexer em Podfile/entitlements, porque a evidência já aponta para outro ponto.

O que eu sei agora
- O plugin está instalado e exposto no runtime.
- Os entitlements e a capability de HealthKit já existem.
- Os logs param em:
  - import do pacote concluído
  - `Health typeof: object`
  - métodos existem
- Mas não aparece:
  - `>>> Health.isAvailable()`
- E a UI fica presa em `importando plugin...`.

Do I know what the issue is?
- Sim: o fluxo não está chegando de forma confiável na primeira chamada nativa (`isAvailable`). O gargalo mais provável está no carregamento/lazy acquisition do plugin dentro do `getHealthPlugin()` e não em Podfile/capability.

Plano de implementação

1. Remover o lazy import do caminho crítico
- Em `src/hooks/useHealthKit.ts`, trocar o `await import('@capgo/capacitor-health')` por import estático:
  - `import { Health } from '@capgo/capacitor-health'`
- Eliminar `getHealthPlugin()` e `pluginRef`.
- Isso tira o `dynamic import` do momento do clique e evita que a conexão dependa dessa etapa assíncrona.

2. Fazer um “ping” nativo antes de pedir permissão
- No mesmo hook, chamar `Health.getPluginVersion()` com timeout curto antes de `isAvailable()`.
- Fluxo novo:
  - `carregando bridge...`
  - `validando plugin nativo...`
  - `verificando disponibilidade...`
  - `solicitando permissão...`
- Como `isAvailable()` no plugin iOS responde imediatamente segundo a implementação oficial, esse ping vai dizer claramente se o bridge está funcional.

3. Blindar também o componente contra promise pendente
- Em `src/components/HealthKitConnect.tsx`, adicionar um watchdog local no `handleConnect`:
  - `Promise.race([onConnect(), timeout])`
- Mesmo que o hook fique preso por qualquer motivo inesperado, o botão sai de “Conectando...” e mostra erro controlado.
- Isso evita novo loop infinito na UI.

4. Melhorar o diagnóstico visível
- Em `src/hooks/useHealthKit.ts`, atualizar `debugStatus` com etapas bem específicas:
  - `carregando bridge`
  - `plugin nativo respondeu`
  - `timeout no plugin nativo`
  - `HealthKit indisponível`
  - `solicitando permissão`
  - `timeout na autorização`
- Em `src/pages/AppleHealth.tsx`, passar `debugStatus` também para `HealthKitConnect`, igual já acontece no FitTracker, para manter o diagnóstico consistente nas duas telas.

5. Reduzir ruído e isolar o erro real
- Manter logs apenas nos pontos críticos:
  - antes/depois de `getPluginVersion`
  - antes/depois de `isAvailable`
  - antes/depois de `requestAuthorization`
- Remover dependência de logs no topo do hook como principal diagnóstico, porque eles só indicam re-render e poluem a leitura.

Arquivos envolvidos
- `src/hooks/useHealthKit.ts`
- `src/components/HealthKitConnect.tsx`
- `src/pages/AppleHealth.tsx`

Resultado esperado
- O app deixa de ficar preso em `Conectando...`.
- Se o problema for o lazy import, o fluxo passa a abrir a permissão normalmente.
- Se o bridge nativo ainda falhar, vamos ver exatamente em qual chamada:
  - `getPluginVersion`
  - `isAvailable`
  - `requestAuthorization`

Observação técnica
- Não vou trocar `CapgoCapacitorHealth` para `Health` no Podfile/Podfile.lock.
- `CapgoCapacitorHealth` é o nome do pod; `Health` é o nome do plugin JS/native bridge. Isso continua correto como está.
