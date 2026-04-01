

## Remover checagens de preferências das automações WhatsApp

### Funções afetadas

Existem **3 edge functions** que verificam `preferences.reminders` antes de enviar:

1. **`whatsapp-scheduled-reminders/index.ts`** (linhas 57-62) — pula usuários com `preferences.reminders !== true`
2. **`fasting-complete-notification/index.ts`** (linhas 90-97) — pula se `prefs.reminders === false`
3. **`whatsapp-send-reminders/index.ts`** (linhas 111-117) — pula lembretes se `prefs.reminders === false`

### Alterações

Remover os blocos de checagem de preferências nas 3 funções, enviando para todos os usuários com WhatsApp verificado independentemente das preferências.

**`whatsapp-scheduled-reminders/index.ts`**: Remover linhas 56-62 (o bloco `const preferences = sub.preferences || {}` e o `if` que faz `continue`).

**`fasting-complete-notification/index.ts`**: Remover linhas 90-97 (o bloco que checa `prefs.reminders === false` e retorna `reminders_disabled`). Também remover `preferences` do select na linha 75, já que não é mais usado.

**`whatsapp-send-reminders/index.ts`**: Remover linhas 111-117 (o bloco que checa `prefs.reminders === false` e faz `continue`). Remover `preferences` do select na linha 98 e a variável `skippedPrefDisabledCount` se existir.

### Sobre a nova function `whatsapp-weekly-objectives`

Como ainda não foi criada, já será implementada sem checagem de preferências.

