

## Correção: Garantir que o RevenueCat registre todas as compras

### O que mudamos (1 arquivo só)

**`src/lib/revenuecat.ts`** — linhas 97-101

Hoje o código tem isto:
```ts
if (loggedInUserId === userId) {
  console.log('[RevenueCat] Already identified as', userId);
  return null; // ← PULA a identificação real
}
```

Vamos trocar por:
```ts
// Sempre chamar Purchases.logIn() para garantir que o SDK
// está realmente identificado — o SDK ignora chamadas redundantes internamente
```

Ou seja, removemos as linhas 98-101 que pulam a identificação. O resto do código fica igual.

### O que isso NÃO muda

- A correção da compra dupla (`forceSubscriptionActive` + `purchaseInProgress`) **continua funcionando normalmente** — ela atua DEPOIS da compra
- Esta mudança atua ANTES da compra — só garante que o RevenueCat sabe quem é o usuário
- Nenhum outro arquivo é alterado

### Resumo

| Arquivo | O que muda |
|---------|-----------|
| `src/lib/revenuecat.ts` | Remove o atalho que pula `Purchases.logIn()` quando acha que já identificou o usuário (linhas 98-101) |

