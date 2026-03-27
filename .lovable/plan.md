

## Corrigir bug de expiração em assinaturas Hotmart

### Problema
Quando `is_hotmart_managed = true`, a função `check-subscription` retorna o status do banco sem verificar se `subscription_end` já passou. Isso mantém usuários com assinatura expirada como "ativos".

### Mudança

**`supabase/functions/check-subscription/index.ts`** — No bloco `is_hotmart_managed`, adicionar validação de data:

```typescript
if (existingSubscription?.is_hotmart_managed) {
  const subEnd = existingSubscription.subscription_end 
    ? new Date(existingSubscription.subscription_end) 
    : null;
  const isActive = subEnd ? subEnd > new Date() : false;

  // Se expirou, atualizar no banco
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
    payment_provider: 'hotmart'
  }), { ... });
}
```

Isso garante que assinaturas Hotmart expiradas sejam marcadas como inativas tanto na resposta quanto no banco de dados.

