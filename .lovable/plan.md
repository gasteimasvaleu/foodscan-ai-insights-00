

## Diagnóstico

A arquitetura do seu outro projeto que funciona usa **funções standalone** em `src/lib/revenuecat.ts` — sem React hooks, sem state, sem closures. Este projeto usa um `useRevenueCat` hook com `useState`, que causa problemas de stale closures e race conditions quando múltiplos componentes o consomem.

O problema fundamental: `Purchases.isConfigured()` pode não estar disponível ou funcionar diferente na v12.3.0 do `@revenuecat/purchases-capacitor`. Se `isConfigured()` retorna `false` mesmo após `configure()`, o SDK nunca é considerado pronto.

Além disso, o `configurePromise` é resetado para `null` no `finally`, então chamadas subsequentes tentam configurar novamente, potencialmente causando conflitos.

## Plano: Reestruturar para a arquitetura que funciona

### 1. Criar `src/lib/revenuecat.ts` (novo arquivo)
Módulo standalone com funções puras (sem React):

- `initRevenueCat()` — configura o SDK uma única vez, com flag booleana simples (`let isConfiguredFlag = false`)
- `purchaseMonthly()` — busca offerings e compra
- `restorePurchases()` — restaura compras
- `getSubscriptionPrice()` — retorna preço
- `checkSubscriptionStatus()` — verifica entitlements
- `syncSubscriptionAfterLogin(userId, email)` — upsert no Supabase
- `logInRevenueCat(userId)` / `logOutRevenueCat()` — associa/desassocia user

Diferença-chave: em vez de confiar em `Purchases.isConfigured()`, usar uma flag local no módulo (`let configured = false`) que é setada após `Purchases.configure()` completar com sucesso. E usar um mutex (promise singleton) para evitar chamadas concorrentes.

### 2. Criar `src/lib/nativeAppleSignIn.ts` (novo arquivo)
Mover a lógica de Apple Sign In para um módulo utilitário standalone (já existe em `src/plugins/NativeAppleSignIn.ts` mas como tipo; aqui seria uma função `nativeAppleSignIn()` que chama o plugin e retorna o resultado).

### 3. Simplificar `src/hooks/useRevenueCat.ts`
O hook passa a ser um **wrapper fino** que:
- Chama as funções de `src/lib/revenuecat.ts`
- Gerencia apenas o estado React para a UI (price, hasPurchased, loading)
- Não faz configure/isConfigured diretamente

### 4. Atualizar Podfile com hardening de code signing
Adicionar remoção de `CODE_SIGNING_ALLOWED`, `CODE_SIGNING_REQUIRED`, `CODE_SIGN_IDENTITY` no `post_install` (conforme memória do projeto).

### Arquivos

| Arquivo | Ação |
|---|---|
| `src/lib/revenuecat.ts` | Criar — funções standalone |
| `src/lib/nativeAppleSignIn.ts` | Criar — wrapper do plugin |
| `src/hooks/useRevenueCat.ts` | Reescrever — wrapper fino sobre lib |
| `ios/App/Podfile` | Atualizar — hardening post_install |

### Detalhes técnicos da `src/lib/revenuecat.ts`

```text
Module-level state (no React):
  let configured = false
  let configuringPromise: Promise<void> | null = null

initRevenueCat():
  if (configured) return
  if (configuringPromise) await configuringPromise; return
  configuringPromise = Purchases.configure({ apiKey })
  configured = true

purchaseMonthly():
  await initRevenueCat()  // ensures configured
  offerings = await Purchases.getOfferings()
  result = await Purchases.purchasePackage(...)
  return customerInfo

// Same pattern for restorePurchases, getPrice, etc.
```

Isso elimina 100% dos problemas de stale closure e race condition porque o estado de configuração vive no módulo, não no React.

