

## Automação de Lembretes via WhatsApp (Z-API)

### 1. Migration: coluna de controle
Adicionar `last_whatsapp_sent_at timestamptz` na tabela `reminders` para evitar envios duplicados no mesmo dia.

### 2. Nova Edge Function: `whatsapp-send-reminders`
- Usa service role key (bypass RLS)
- Query: `reminders` onde `is_active = true`, `reminder_date = CURRENT_DATE`, `reminder_time` dentro de ±5 min do horário atual, e `last_whatsapp_sent_at` é NULL ou anterior a hoje
- JOIN com `whatsapp_subscriptions` (verified = true, preferences->reminders = true) para obter phone
- Envia via Z-API (`send-text`) usando secrets já configurados (`ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_SECURITY_TOKEN`)
- Após envio: `UPDATE reminders SET last_whatsapp_sent_at = now()`
- Registra em `whatsapp_messages` para histórico

### 3. Config
Adicionar `[functions.whatsapp-send-reminders]` com `verify_jwt = false` no `supabase/config.toml` (será chamado pelo cron sem JWT).

### 4. Cron Job (pg_cron + pg_net)
SQL insert (não migration) para criar job a cada 5 minutos invocando a function via `net.http_post`.

### Arquivos
| Arquivo | Ação |
|---|---|
| `supabase/functions/whatsapp-send-reminders/index.ts` | Novo |
| `supabase/config.toml` | Adicionar config |
| Migration SQL | `ALTER TABLE reminders ADD COLUMN last_whatsapp_sent_at timestamptz` |
| SQL insert | Cron job pg_cron |

