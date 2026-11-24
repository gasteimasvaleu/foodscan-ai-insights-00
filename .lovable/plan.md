# Nova imagem da tela de assinatura

A imagem antiga (assinatura-pro-anual.png) e de antes do ajuste da regra 3.1.2(c) da Apple, entao esta desatualizada.

1. Abrir a tela de assinatura atual simulando o iPhone, com os precos ja definidos: Anual R$ 179,90 e Mensal R$ 49,90.
2. Tirar o print com o plano anual selecionado, no tamanho do iPhone (393x852, alta resolucao).
3. Conferir se o preco aparece como o maior destaque e se nada ficou cortado.
4. Salvar como **assinatura-pro-v2.png** nos seus arquivos e te mandar aqui no chat.

## Detalhes tecnicos
- Playwright repetindo o metodo do print anterior: forcar Capacitor.isNativePlatform()=true e trocar as ofertas do RevenueCat por precos falsos so durante o print. Nenhuma mudanca no app.
