# Retirar a mensagem motivacional

Já feito: o envio automático das 06h foi desligado (a rotina diária foi removida). Ninguém recebe mais a mensagem.

Falta tirar a opção das telas, para ninguém ativar algo que não chega:
- Perfil (preferências do WhatsApp): remover "Mensagem motivacional diária".
- Configuração do WhatsApp: remover o mesmo item.
- Página do Sono: remover o cartão "Mensagem Motivacional" com as categorias.

Os outros envios (lembretes, alerta de jejum, resumo semanal) e a análise de foto pelo Twilio não mudam.

## Detalhes técnicos
- src/pages/Profile.tsx e src/components/WhatsAppSetup.tsx: remover o item `key: "motivational"`.
- src/pages/Sleep.tsx: remover o bloco do card motivacional.
- A função whatsapp-motivational continua no servidor, sem agendamento.
