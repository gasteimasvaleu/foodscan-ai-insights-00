

## Simplificar cron para função SQL direta

### Problema
A implementação atual usa `pg_net` para chamar uma Edge Function via HTTP, o que é mais complexo e frágil. Uma função SQL direta executada pelo `pg_cron` é mais simples e eficiente.

### Mudanças

1. **Remover `supabase/functions/expire-subscriptions/index.ts`** — não será mais necessária

2. **Remover entrada `[functions.expire-subscriptions]` do `supabase/config.toml`**

3. **SQL no Supabase SQL Editor** — criar a função e agendar o cron:

```sql
CREATE OR REPLACE FUNCTION public.expire_overdue_subscriptions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count integer;
BEGIN
  UPDATE subscribers
  SET subscribed = false, updated_at = now()
  WHERE subscribed = true
    AND subscription_end < now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RAISE LOG 'Expired % subscriptions at %', expired_count, now();
END;
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'expire-overdue-subscriptions',
  '0 3 * * *',
  'SELECT public.expire_overdue_subscriptions()'
);
```

### Vantagens
- Sem dependência do `pg_net`
- Execução direta no banco, sem overhead HTTP
- Mais confiável (sem risco de timeout de rede)
- Padrão igual ao seu outro app

