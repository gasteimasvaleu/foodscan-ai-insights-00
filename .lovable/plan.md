

## Corrigir PaywallScreen: garantir identifyUser antes da compra e usar customerInfo direto

### Problema

1. O `purchaseMonthly()` pode executar antes do `identifyUser()` no AuthProvider (que roda em `setTimeout(..., 0)`), fazendo a compra ficar associada a um usuário anônimo no RevenueCat.
2. Após a compra, `syncSubscriptionAfterLogin` tenta detectar entitlements com retry de 1.5s, mas pode falhar se o RevenueCat ainda não propagou. Isso faz `checkSubscription()` retornar `subscribed: false`, mantendo o paywall visível e causando dupla cobrança.

### Alterações

#### 1. `src/components/PaywallScreen.tsx` — `handlePurchase`

Antes de chamar `rcPurchaseMonthly()`, chamar `identifyUser(user.id)` explicitamente para garantir que a compra será associada ao UUID correto.

Após a compra bem-sucedida, usar o `customerInfo` retornado diretamente pelo `purchaseMonthly()` para gravar no Supabase via upsert direto, sem depender do `syncSubscriptionAfterLogin` e seus retries. Extrair entitlements do `customerInfo` e fazer upsert na tabela `subscribers`.

Novo fluxo do `handlePurchase`:
```
1. await identifyUser(user.id)
2. customerInfo = await rcPurchaseMonthly()
3. Extrair entitlement do customerInfo
4. Upsert direto no Supabase (subscribers)
5. await onSubscribed() (re-valida via check-subscription)
```

#### 2. `src/lib/revenuecat.ts` — Nova função `upsertSubscriptionFromCustomerInfo`

Criar uma função que recebe `userId`, `email` e `customerInfo` e faz o upsert na tabela `subscribers` diretamente, sem precisar buscar entitlements novamente. Reutiliza a lógica de claim de órfãos (steps 4a-4d) já existente em `syncSubscriptionAfterLogin`, mas sem os retries de detecção.

#### 3. `src/components/PaywallScreen.tsx` — `handleRestore`

Aplicar a mesma lógica: chamar `identifyUser` antes, e usar o `customerInfo` retornado por `restorePurchases` para gravar diretamente.

### Resultado esperado

- Compra sempre associada ao UUID correto no RevenueCat
- Gravação imediata no Supabase sem depender de propagação de entitlements
- Redirect imediato após primeira compra, eliminando o cenário de dupla cobrança

