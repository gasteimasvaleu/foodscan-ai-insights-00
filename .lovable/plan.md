# Print da tela de assinatura (plano anual)

- Gerar uma imagem da tela de assinar, no tamanho de iPhone, com o plano anual selecionado.
- Preços de exemplo: Anual R$ 179,90 com 7 dias grátis, Mensal R$ 49,90. A tela calcula sozinha o preço por mês e o "Economize X%".
- Nenhuma mudança no app: os preços de exemplo entram só numa cópia temporária, usada para tirar o print.
- Entrega: arquivo PNG em Arquivos, mostrado aqui no chat.

## Detalhes técnicos
- Playwright em 393x852 dpr 3, com uma sessão de teste. Interceptar o módulo de revenuecat/Capacitor via route no Vite (ou uma página temporária em /tmp que renderiza o PaywallScreen com planos falsos), simulando plataforma iOS.
- Salvar em /mnt/documents/assinatura-pro-anual.png.
