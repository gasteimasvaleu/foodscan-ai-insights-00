

## Corrigir Duplicidade de Compra no Paywall iOS

### Problema
Após o usuário assinar com sucesso na App Store, o Paywall reaparece e exige uma segunda compra. O fluxo atual:

1. `purchaseMonthly()` → Apple confirma → retorna `customerInfo`
2. `upsertSubscriptionFromCustomerInfo()` → tenta gravar no banco via cliente
3. `checkSubscription()` → edge function consulta o banco → retorna `subscribed: false` (provável race condition ou dado incompleto)
4. Paywall re-renderiza → usuário clica de novo

**Causa raiz provável**: O `checkSubscription` depende 100% de encontrar um registro válido no banco com `subscription_end` no futuro. Se o upsert falhou silenciosamente, se o `expirationDate` veio `null` do RevenueCat, ou se um `TOKEN_REFRESHED` do Supabase re-disparou a checagem durante o fluxo de compra, o resultado é `subscribed: false` — e o paywall reaparece.

### Solução

**Abordagem**: Após uma compra confirmada pela Apple (customerInfo com entitlements ativos), **setar o estado de assinatura diretamente no AuthProvider** sem depender do roundtrip ao banco. A gravação no banco continua acontecendo em background.

#### 1. AuthProvider — Novo método `forceSubscriptionActive()`

Adicionar ao contexto um método que seta diretamente:
```ts
subscriptionStatus = { subscribed: true, subscription_tier: 'Premium', subscription_end: expirationDate }
subscriptionReady = true
```

Isso faz o Index.tsx sair do Paywall imediatamente após a Apple confirmar.

#### 2. PaywallScreen — Usar `forceSubscriptionActive` após compra

Em vez de depender de `checkSubscription()` (que consulta o banco), o fluxo passa a ser:

```
purchaseMonthly() → customerInfo com entitlements ativos
  → forceSubscriptionActive(expirationDate)  ← imediato, sem DB
  → upsertSubscriptionFromCustomerInfo()     ← background, best-effort
```

Se o customerInfo não tiver entitlements ativos, aí sim faz fallback para `checkSubscription()`.

#### 3. Proteção contra TOKEN_REFRESHED durante compra

Adicionar um ref `purchaseInProgress` no PaywallScreen ou no AuthProvider. Quando `purchaseInProgress = true`, o useEffect que assiste `[user, authReady]` **não** re-dispara `checkSubscription()`, evitando que um token refresh sobrescreva o estado com `subscribed: false` durante o fluxo de compra.

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/AuthProvider.tsx` | Adicionar `forceSubscriptionActive()` ao contexto + ref `purchaseInProgress` para bloquear re-check durante compra |
| `src/components/PaywallScreen.tsx` | Chamar `forceSubscriptionActive()` após compra bem-sucedida em vez de `checkSubscription()` |
| `src/hooks/useAuth.tsx` | Expor `forceSubscriptionActive` no hook |

