

## Blindar o HealthKit contra travamento + melhorar diagnóstico

### Esclarecimento importante

O nome no Podfile (`CapgoCapacitorHealth`) é o nome do **pacote CocoaPods** — ele está correto e NÃO precisa mudar. O nome `Health` é o nome do **plugin no runtime do Capacitor** (como ele se registra no bridge JS↔nativo). São coisas diferentes:

```text
Podfile:     CapgoCapacitorHealth  → nome do pacote (gerenciador de dependências)
JS Runtime:  Health                → nome do plugin (bridge Capacitor)
```

Ambos estão corretos como estão.

---

### Mudanças

**1. `src/hooks/useHealthKit.ts`** — Refatorar o hook:

- Adicionar helper `withTimeout(promise, ms, label)` que usa `Promise.race` com timeout
- Envolver `Health.isAvailable()` com timeout de 8s
- Envolver `Health.requestAuthorization()` com timeout de 15s (o prompt iOS pode demorar)
- Simplificar `getHealthPlugin()` — remover checagem de `CapgoCapacitorHealth` (irrelevante no runtime), manter apenas log de `Health`
- Atualizar `debugStatus` em cada etapa para diagnóstico visual preciso:
  - `"importando plugin..."` → `"verificando disponibilidade..."` → `"solicitando permissão..."` → `"Conectado!"` ou erro específico
- Garantir que `finally` sempre encerra o loading, mesmo em timeout

**2. `src/components/HealthKitConnect.tsx`** — Sem mudanças estruturais, apenas garantir que o `debugStatus` sempre aparece visível durante o fluxo (já funciona assim).

### Resultado esperado

- Se o bridge nativo responder: fluxo normal, prompt iOS abre
- Se o bridge travar: timeout de 8s, mensagem clara na tela e nos logs, botão volta ao estado normal
- O app nunca mais fica preso em "Conectando..."

### Após implementação

1. `git pull && npm run build && npx cap sync ios`
2. Clean Build no Xcode → Run no device
3. Clicar em "Conectar Apple Health" e compartilhar o que aparece na tela e nos logs

