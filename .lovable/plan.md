

## Remover Stripe e colunas Hotmart do banco

### Resumo

Remover toda dependencia de Stripe (edge functions e logica no check-subscription) e remover as colunas Hotmart obsoletas das tabelas `subscribers` e `registration_tokens`. O `check-subscription` passara a funcionar apenas com Apple/RevenueCat e registros manuais.

### Alteracoes

#### 1. Deletar edge functions Stripe
- **Deletar**: `supabase/functions/validate-session/index.ts` (100% Stripe)

#### 2. Reescrever `check-subscription` sem Stripe
**`supabase/functions/check-subscription/index.ts`**

Remover import do Stripe, remover `STRIPE_SECRET_KEY`, remover toda logica de `stripe.customers.list`, `stripe.subscriptions.list`, `stripe.prices.retrieve`. A funcao passara a:
- Autenticar usuario
- Buscar registro em `subscribers`
- Se `payment_provider === 'apple'`: validar `subscription_end > now()`
- Caso contrario: retornar o estado atual do registro (para tokens manuais com `payment_provider = null` ou outro)
- Manter protecao de race condition para registros recentes

#### 3. Migration: remover colunas Hotmart e Stripe da tabela `subscribers`
```sql
ALTER TABLE public.subscribers
  DROP COLUMN IF EXISTS is_hotmart_managed,
  DROP COLUMN IF EXISTS hotmart_transaction_id,
  DROP COLUMN IF EXISTS stripe_customer_id;
```

#### 4. Migration: remover colunas Hotmart da tabela `registration_tokens`
```sql
ALTER TABLE public.registration_tokens
  DROP COLUMN IF EXISTS hotmart_transaction_id,
  DROP COLUMN IF EXISTS hotmart_product_id;
```

#### 5. Atualizar `send-registration-token`
Remover campos `hotmart_transaction_id` e `hotmart_product_id` do insert (linhas 92-93), ja que as colunas serao removidas.

#### 6. Manter intactos
- `supabase/functions/revenuecat-webhook/index.ts`
- `supabase/functions/validate-token/index.ts`
- `src/hooks/useSubscription.ts`
- `src/hooks/useRevenueCat.ts`

