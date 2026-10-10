# Renovação de chaves Apple (só informação)

Não é preciso mudar nada no app. Esta resposta é só para tirar a dúvida.

## Não vencem (valem até você revogar)
- Chave de API do App Store Connect (.p8 usada no Appflow)
- Chave de notificações push (APNs .p8)
- Chave do Login com Apple (.p8)

Você só precisa criar outra se revogar a chave, perder o arquivo .p8 (ele só pode ser baixado uma vez) ou se ela foi criada como "Individual" e esse usuário sair do time.

## Vencem
- Certificado de distribuição (iOS Distribution): a cada 1 ano
- Provisioning profiles (app e widget): a cada 1 ano, ou quando o certificado for renovado
- Senha de app específico: deixa de valer quando você troca a senha do Apple ID
- Assinatura do Apple Developer Program: renovação anual

## Dica
Anote a data de vencimento do certificado e dos dois profiles. Quando renovar, envie os novos arquivos para o Appflow.
