

## Enviar lembrete WhatsApp quando o jejum terminar

### Abordagem
Quando o timer do jejum atingir 100% (meta cumprida), o frontend detecta isso e chama uma edge function que envia uma mensagem WhatsApp via Z-API parabenizando o usuário. A infraestrutura Z-API já está configurada e funcional no projeto (usada em `whatsapp-send-reminders`).

### Alterações

**1. Criar edge function `supabase/functions/fasting-complete-notification/index.ts`**
- Recebe `user_id` no body
- Busca o jejum ativo do usuário (`fasting_records` onde `ended_at IS NULL`)
- Calcula se o tempo decorrido atingiu o `target_hours`
- Busca o telefone do usuário em `whatsapp_subscriptions` (verificado)
- Envia mensagem via Z-API com emoji ⏰ e texto parabenizando (ex: "🎉 *Parabéns! Seu jejum de 16h foi concluído!*\n\nVocê atingiu sua meta! 💪\n\nWe Diet - Cuidando da sua saúde!")
- Usa os mesmos secrets já configurados: `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_SECURITY_TOKEN`

**2. Editar `src/pages/IntermittentFasting.tsx`**
- No `useEffect` do timer, quando `progress >= 100` pela primeira vez, chamar `supabase.functions.invoke('fasting-complete-notification', { body: { user_id } })`
- Usar um `useRef` para garantir que a notificação seja enviada apenas uma vez por sessão de jejum (evitar envios repetidos a cada tick do timer)

### Considerações
- Só envia se o usuário tiver uma assinatura WhatsApp verificada
- Se não tiver WhatsApp configurado, simplesmente ignora (sem erro visível)
- A notificação é enviada no momento em que a meta é atingida, não quando o usuário finaliza manualmente

