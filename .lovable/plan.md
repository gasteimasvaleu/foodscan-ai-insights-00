

# Plano: Criar registro em `subscribers` apos login com Apple

## Problema raiz

O fluxo atual e: Assinar (anonimo) → Login com Apple. No `handlePurchase`, `syncSubscriptionAfterLogin` so executa se `user?.id && user?.email` — mas nesse momento o usuario ainda nao fez login, entao `user` e `null` e o sync e ignorado. Depois, no `AppleSignInButton`, o login funciona mas ninguem cria o registro em `subscribers`.

Nao e problema de sandbox — e um bug de sequencia logica.

## Solucao

Apos o login com Apple ser bem-sucedido no `AppleSignInButton.tsx`, verificar o status da assinatura no RevenueCat (usando `logInRevenueCat` + `checkSubscriptionStatus`) e, se ativa, chamar `syncSubscriptionAfterLogin` para criar o registro na tabela `subscribers`.

## Alteracoes

### `src/components/AppleSignInButton.tsx`

Apos o `signInWithIdToken` retornar sucesso (linha 38-50), adicionar:

```typescript
// After profile upsert, sync RevenueCat subscription
if (data.user) {
  try {
    const { logInRevenueCat, checkSubscriptionStatus, syncSubscriptionAfterLogin } = await import('@/lib/revenuecat');
    const customerInfo = await logInRevenueCat(data.user.id);
    const isActive = await checkSubscriptionStatus();
    if (isActive) {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      const { customerInfo: fullInfo } = await Purchases.getCustomerInfo();
      await syncSubscriptionAfterLogin(
        data.user.id,
        data.user.email || '',
        fullInfo
      );
    }
  } catch (err) {
    console.error('[AppleSignIn] RC sync error:', err);
  }
}
```

Isso garante que, independente da ordem (assinar primeiro ou logar primeiro), o registro em `subscribers` sera criado assim que o login com Apple for concluido e houver assinatura ativa no RevenueCat.

