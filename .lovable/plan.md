

## Sincronizar assinaturas Apple/RevenueCat com a tabela `subscribers`

### Problema atual
O `useRevenueCat` gerencia o estado da assinatura Apple apenas localmente (em memoria). Apos uma compra bem-sucedida, `hasPurchased` fica `true` no dispositivo, mas a tabela `subscribers` no Supabase nao e atualizada. Isso significa que:
- No acesso web, o usuario aparece como "nao assinante"
- A edge function `check-subscription` nao reconhece assinaturas Apple

### Solucao

**1. Atualizar `useRevenueCat.ts` para sincronizar com Supabase**

Apos `purchaseMonthly()` ou `restorePurchases()` com sucesso, e tambem na `checkExistingSubscription()` durante init, chamar uma funcao que faz upsert na tabela `subscribers` com:
- `payment_provider: 'apple'`
- `subscribed: true`
- `subscription_tier: 'Premium'` (ou derivado do entitlement)
- `subscription_end`: extraido de `customerInfo.entitlements.active[entitlementId].expirationDate`

O hook precisa receber o `user` autenticado para poder identificar o `user_id` e `email`. Sera necessario alterar a assinatura do hook para receber o usuario.

**2. Atualizar `check-subscription/index.ts`**

Adicionar tratamento para `payment_provider === 'apple'`, similar ao Hotmart:
- Se `payment_provider` e `'apple'`, verificar `subscription_end` contra a data atual
- Nao sobrescrever com dados Stripe vazios
- Marcar como inativo se expirado

**3. Atualizar `AuthCard.tsx`**

Passar o `user` para o hook `useRevenueCat` para que ele possa sincronizar.

### Arquivos a modificar

| Arquivo | Mudanca |
|---|---|
| `src/hooks/useRevenueCat.ts` | Receber `user`, adicionar `syncToSupabase()` que faz upsert na tabela `subscribers` apos compra/restore/init com entitlements ativos |
| `supabase/functions/check-subscription/index.ts` | Adicionar bloco de protecao para `payment_provider === 'apple'`, validando `subscription_end` (mesmo padrao do Hotmart) |
| `src/components/AuthCard.tsx` | Passar `user` ao chamar `useRevenueCat(user)` |

### Detalhes tecnicos

**Sync no useRevenueCat (client-side):**
```typescript
const syncToSupabase = async (customerInfo: CustomerInfo) => {
  if (!user) return;
  const entitlements = customerInfo.entitlements.active;
  const entitlementKeys = Object.keys(entitlements);
  if (entitlementKeys.length === 0) return;
  
  const firstEntitlement = entitlements[entitlementKeys[0]];
  const expirationDate = firstEntitlement.expirationDate; // ISO string or null
  
  await supabase.from('subscribers').upsert({
    user_id: user.id,
    email: user.email,
    subscribed: true,
    subscription_tier: 'Premium',
    subscription_end: expirationDate,
    payment_provider: 'apple',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'email' });
};
```

**Protecao no check-subscription:**
```typescript
// Apos o bloco is_hotmart_managed, adicionar:
if (existingSubscription?.payment_provider === 'apple') {
  const subEnd = existingSubscription.subscription_end 
    ? new Date(existingSubscription.subscription_end) : null;
  const isActive = subEnd ? subEnd > new Date() : false;
  
  if (!isActive && existingSubscription.subscribed) {
    await supabaseClient.from("subscribers").update({
      subscribed: false,
      updated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
  }
  
  return new Response(JSON.stringify({
    subscribed: isActive,
    subscription_tier: existingSubscription.subscription_tier,
    subscription_end: existingSubscription.subscription_end,
    payment_provider: 'apple'
  }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
}
```

### Observacao
Futuramente, configurar webhooks do RevenueCat apontando para uma edge function dedicada seria a forma mais robusta de manter o status atualizado (renovacoes, cancelamentos, reembolsos). Mas a sincronizacao client-side resolve o cenario imediato.

