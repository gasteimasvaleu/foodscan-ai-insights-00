

## Diagnóstico: o plugin nativo está registrado no bridge?

### Análise do problema real

Os logs param em `Health plugin object: {}` e pulam direto para o erro. O log `[HealthKit] Checking availability...` **nunca aparece**. Isso significa uma de duas coisas:
1. A chamada `Health.isAvailable()` trava silenciosamente e o timeout de 20s do HealthKitConnect dispara primeiro (mas nesse caso veríamos "Checking availability..." no log)
2. Algo está interceptando o fluxo antes disso

O problema central é que o **plugin JS é um Proxy** (por isso aparece como `{}`), mas precisamos confirmar se o **lado nativo do plugin está registrado no bridge do Capacitor**. Se não estiver, qualquer chamada ao Proxy vai travar indefinidamente esperando uma resposta nativa que nunca vem.

### Plano de implementação

**1. Adicionar diagnóstico de registro nativo em `useHealthKit.ts`**
Antes de qualquer chamada ao plugin, logar:
- `Capacitor.isPluginAvailable('CapgoCapacitorHealth')` — verifica se o native side registrou o plugin
- `Object.keys(Capacitor.Plugins)` — lista todos os plugins nativos registrados
- Tentar chamar `Health.isAvailable()` com um try/catch **sem** timeout primeiro, logando o resultado ou erro real

**2. Corrigir o logging de erros em `HealthKitConnect.tsx`**
O `JSON.stringify(err, Object.getOwnPropertyNames(err))` pode produzir `{}` se o erro não for um Error padrão. Substituir por:
```
console.error('error message:', err?.message);
console.error('error string:', String(err));
console.error('error type:', typeof err, err?.constructor?.name);
```

**3. Simplificar o fluxo de `requestPermissions`**
- Remover a camada dupla de timeouts (10s no hook + 20s no componente)
- Usar um único timeout de 15s no hook
- Logar **cada passo** com `console.log` imediatamente antes e depois da chamada nativa
- Separar claramente: "plugin registrado?", "isAvailable?", "requestAuthorization?"

**4. Adicionar log no startup para verificar o bundle**
No início do componente FitTracker, logar um ID de build único para confirmar que o código mais recente está rodando no device.

### Arquivos alterados
- `src/hooks/useHealthKit.ts` — diagnóstico de registro nativo + simplificação do fluxo
- `src/components/HealthKitConnect.tsx` — fix do logging de erros

### Após implementar
1. `npm run build && npx cap sync ios`
2. Build via Xcode no device
3. Tocar em "Conectar Apple Health"
4. Compartilhar os logs do Xcode — agora saberemos se o plugin nativo está ou não registrado

