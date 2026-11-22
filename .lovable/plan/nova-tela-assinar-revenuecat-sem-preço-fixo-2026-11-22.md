# Nova tela /assinar (RevenueCat, sem preço fixo)

## Sobre o entitlement
O app hoje NÃO usa "wediet Pro". A tela e o cartão de login procuram "Premium" ou "premium", e o servidor (rc-sync) aceita qualquer acesso ativo. Vou centralizar o nome numa única constante e aceitar "wediet Pro" e também "Premium" — assim nada quebra para quem já assinou, seja qual for o nome no painel do RevenueCat. Confira no RevenueCat (Product catalog → Entitlements) qual nome existe de fato.

## O que muda na tela (mesmo visual rosa, cartão glass, logo, selo WE DIET PRO)
- Botão X rosa no canto superior, sempre visível (volta para a tela anterior / Home).
- 5 benefícios curtos com ícone: FoodScan ilimitado, NutriCoach com IA, Cardápio personalizado com IA, Faça em Casa, Lembretes e resumos no WhatsApp.
- Dois cartões de plano (um embaixo do outro no celular, lado a lado no tablet):
  - Anual (selecionado, selo "Mais escolhido", borda rosa): preço por mês calculado, "cobrado X por ano", selo "7 dias grátis" se houver teste, "Economize X%" calculado com os preços reais.
  - Mensal (mais discreto): "X/mês", selo de teste só se existir.
  - Marcação de seleção com check.
- Carregando: esqueleto no lugar dos cartões. Falha: "Não foi possível carregar os planos agora" + "Tentar de novo".
- Botão: "Começar 7 dias grátis" ou "Assinar agora", com a linha pequena de preço/cancelamento abaixo. Durante a compra: loading e cartões bloqueados.
- Depois da compra: segue a regra de segurança atual — o servidor confirma no RevenueCat antes de liberar o Pro. Confirmado: toast "Bem-vindo ao Wediet Pro!" e volta para a Home. Cancelou a janela da Apple: sem erro. Outro erro: "Não foi possível concluir a assinatura. Nenhuma cobrança foi feita." com "Tentar de novo".
- Restaurar compras: "Assinatura restaurada" e Home, ou "Nenhuma assinatura encontrada nesta conta".
- Texto legal por plataforma (Apple / Google Play), sem "iTunes", com links Termos e Privacidade.
- No navegador: sem RevenueCat; benefícios + "Assine pelo app" com botões App Store e Google Play.
- Nenhum preço escrito no código (remove o "R$ 49,90" de reserva).

## Verificação do Pro no resto do app
- Todos os pontos que leem o entitlement passam a usar a mesma constante.
- Ao abrir o app e ao voltar do segundo plano, atualiza o status (via servidor, mantendo a proteção contra "assinatura emprestada").

## Detalhes técnicos
- src/lib/revenuecat.ts: `PRO_ENTITLEMENTS = ['wediet Pro','Premium','premium']`, `hasProEntitlement(ci)`, `getPlans()` (offerings.current.annual/monthly), `purchasePackage(pkg)` tratando `userCancelled`.
- PaywallScreen.tsx reescrito; AuthCard.tsx usa `hasProEntitlement`.
- AuthProvider: listener `App.addListener('appStateChange')` chama o check de assinatura ao voltar ao primeiro plano.
- Pacote anual precisa existir na Offering atual do RevenueCat (nutri_annual); se não existir, só o mensal aparece.
- Sem build nativo novo: vai por Live Update.
