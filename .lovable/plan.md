# Retirar a mensagem motivacional e o resumo de domingo

Já feito: o envio automático da motivacional das 06h foi desligado.

O que falta:
- Desligar também o envio automático do resumo semanal (domingo 22h).
- Perfil (preferências do WhatsApp): remover "Mensagem motivacional diária" e "Resumo semanal de objetivos".
- Configuração do WhatsApp: remover os mesmos dois itens.
- Página do Sono: remover o cartão "Mensagem Motivacional" com as categorias.

Continuam iguais: lembretes, alerta de jejum e a análise de foto pelo Twilio.

## Detalhes técnicos
- `cron.unschedule('weekly-objectives-whatsapp')`.
- src/pages/Profile.tsx e src/components/WhatsAppSetup.tsx: remover itens `motivational` e `weekly_objectives`.
- src/pages/Sleep.tsx: remover o bloco do card motivacional.
- As funções whatsapp-motivational e whatsapp-weekly-objectives ficam no servidor, sem agendamento.
