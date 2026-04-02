

## Card de Notificações WhatsApp na Página Perfil (Revisado)

### Contexto
As chaves `daily_summary` e `weekly_summary` no default de `preferences` em `whatsapp_subscriptions` são legado do Twilio e não são usadas por nenhuma edge function. Vamos limpá-las e criar as 4 chaves corretas para as funções Z-API.

### Alterações

**1. Migration — Atualizar default de `preferences` e registros existentes**

Alterar o default da coluna `preferences` para:
```json
{
  "reminders": true,
  "fasting_notification": true,
  "weekly_objectives": true,
  "motivational": true
}
```
E atualizar registros existentes para adicionar as novas chaves (sem remover as antigas para não quebrar nada).

**2. Card na página Profile.tsx**

Novo card "Notificações WhatsApp" com 4 switches:

| Toggle | Chave em `preferences` | Descrição |
|--------|----------------------|-----------|
| Lembretes agendados | `reminders` | Refeições, sono, exercício, etc. |
| Alerta de jejum completo | `fasting_notification` | Aviso quando a meta de jejum é atingida |
| Resumo semanal de objetivos | `weekly_objectives` | Enviado aos domingos às 22h |
| Mensagem motivacional diária | `motivational` | Enviada às 6h com IA |

- Só aparece se o usuário tiver WhatsApp verificado (consulta `whatsapp_subscriptions` com `verified = true`)
- Cada toggle faz update no JSONB `preferences` via `supabase.update()`
- Usa o padrão visual existente da página (cards rosa `rounded-3xl`)

**3. Edge Functions — Respeitar preferências**

Adicionar checagem `preferences->>'chave' != 'false'` em cada função antes de enviar:

- `whatsapp-send-reminders` → checar `reminders`
- `fasting-complete-notification` → checar `fasting_notification`
- `whatsapp-weekly-objectives` → checar `weekly_objectives`
- `whatsapp-motivational` → checar `motivational`

A verificação usa `!= 'false'` para compatibilidade com registros que não possuem a chave (tratados como ativados por padrão).

### Arquivos alterados
- Migration SQL (default de `preferences` + backfill)
- `src/pages/Profile.tsx` — novo card com 4 switches
- `supabase/functions/whatsapp-send-reminders/index.ts`
- `supabase/functions/fasting-complete-notification/index.ts`
- `supabase/functions/whatsapp-weekly-objectives/index.ts`
- `supabase/functions/whatsapp-motivational/index.ts`

