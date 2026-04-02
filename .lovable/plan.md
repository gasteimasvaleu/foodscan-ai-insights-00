

## Corrigir Preferências no WhatsAppSetup.tsx

### Problema
O componente `WhatsAppSetup.tsx` (usado na página `/whatsapp-settings`) mostra 3 toggles antigos do Twilio:
- "Lembretes de refeições" → `reminders`
- "Resumo diário" → `daily_summary`
- "Resumo semanal" → `weekly_summary`

Esses não correspondem às 4 funções Z-API reais. Enquanto isso, o card correto já existe no Profile.tsx com os 4 toggles certos.

### Correção

**Arquivo: `src/components/WhatsAppSetup.tsx`**

1. Atualizar o state `preferences` para usar as 4 chaves corretas:
   - `reminders` → "Lembretes agendados" (refeições, sono, exercício)
   - `fasting_notification` → "Alerta de jejum completo"
   - `weekly_objectives` → "Resumo semanal de objetivos"
   - `motivational` → "Mensagem motivacional diária"

2. Substituir os 3 toggles antigos pelos 4 toggles corretos (mesmo padrão do card no Profile.tsx)

3. Remover o botão "Salvar Preferências" e fazer o update individual por toggle (mesmo padrão do Profile.tsx com `handleTogglePref`), ou manter o botão mas salvando as chaves corretas

4. Carregar as preferências existentes do banco ao montar o componente (atualmente não carrega — o estado sempre começa com defaults)

### Arquivos alterados
- `src/components/WhatsAppSetup.tsx` — substituir toggles antigos pelos 4 corretos das funções Z-API

