

## Correção de Fuso Horário nos Lembretes WhatsApp

### Problema
- O usuário salva `reminder_time` como `09:36` (horário local do Brasil, UTC-3)
- A edge function compara com `now()` em UTC (`12:36`)
- `09:36` nunca cai na janela UTC, logo o lembrete nunca é enviado

### Solução
Ajustar a edge function `whatsapp-send-reminders` para converter o horário UTC para o fuso do Brasil (UTC-3) antes de comparar com `reminder_time`.

### Mudança
**Arquivo**: `supabase/functions/whatsapp-send-reminders/index.ts`

- Ao calcular `currentTime`, subtrair 3 horas do UTC para obter o horário de Brasília
- Manter a mesma lógica de janela ±5 minutos, mas usando o horário convertido
- Ajustar também a comparação de `reminder_date` para usar a data no fuso BR

### Detalhe técnico
```text
Antes:  currentTime = now.toTimeString() → "12:36:00" (UTC)
Depois: currentTime = (now - 3h).toTimeString() → "09:36:00" (BRT)
```

Assim `09:36` (salvo) cairá na janela `09:31-09:41` (BRT) e o lembrete será encontrado e enviado.

