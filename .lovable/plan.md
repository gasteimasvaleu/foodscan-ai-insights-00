

## Cron diário para expirar assinaturas

### Problema
A expiração só é processada quando o usuário abre o app. Assinaturas expiradas ficam com `subscribed = true` no banco até o próximo acesso.

### Solução
Criar uma Edge Function `expire-subscriptions` executada diariamente via `pg_cron` que marca como `subscribed = false` todas as assinaturas onde `subscription_end < now()` e `subscribed = true`.

### Changes

1. **Nova Edge Function `supabase/functions/expire-subscriptions/index.ts`**
   - Usa `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS
   - Query: `UPDATE subscribers SET subscribed = false, updated_at = now() WHERE subscribed = true AND subscription_end < now()`
   - Retorna contagem de registros atualizados
   - Protegida por verificação de Authorization header (Bearer anon key ou service role)

2. **`supabase/config.toml`** — Adicionar config para a nova function com `verify_jwt = false` (será chamada pelo cron)

3. **SQL via Supabase SQL Editor** — Habilitar `pg_cron` + `pg_net` e criar o job:
   ```sql
   -- Executar diariamente às 03:00 UTC
   SELECT cron.schedule(
     'expire-subscriptions-daily',
     '0 3 * * *',
     $$
     SELECT net.http_post(
       url := 'https://zyhmwcsfifdepqnnrguo.supabase.co/functions/v1/expire-subscriptions',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer <anon_key>"}'::jsonb,
       body := '{}'::jsonb
     ) AS request_id;
     $$
   );
   ```

### Technical detail
- A function faz um único UPDATE em batch, sem loops
- Logs detalhados com contagem de assinaturas expiradas
- Roda às 03:00 UTC (meia-noite horário de Brasília) para mínimo impacto

