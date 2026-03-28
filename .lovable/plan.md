
Problema identificado: o erro continua porque o hook está assumindo que o SDK foi configurado com base em estado local do React (`initialized` / `initializedRef`), mas o próprio plugin nativo do RevenueCat continua dizendo que não foi configurado. Ou seja: o “fonte da verdade” do app e o “fonte da verdade” do SDK ficaram desencontrados.

O que corrigir:

1. Tornar a inicialização do RevenueCat idempotente e baseada no SDK real
- Em `src/hooks/useRevenueCat.ts`, parar de confiar só em `initializedRef`.
- Antes de qualquer `getOfferings`, `restorePurchases`, `getCustomerInfo` ou `logIn`, consultar `Purchases.isConfigured()`.
- Se não estiver configurado, chamar `Purchases.configure(...)` e só então seguir.
- Evitar chamadas concorrentes criando uma promise/ref de inicialização única, para dois componentes não tentarem configurar ao mesmo tempo.

2. Remover a cadeia que hoje chama métodos dependentes logo após um “configure” otimista
- Hoje `initRevenueCat()` já faz `checkExistingSubscription()` e `fetchPrice()` em sequência.
- Vou reorganizar isso para:
  - garantir configuração real primeiro;
  - só depois buscar assinatura/preço;
  - não marcar `initialized=true` até confirmar via `isConfigured()`.

3. Blindar os fluxos de compra/restauração/login
- `purchaseMonthly()` e `restorePurchases()` devem sempre passar por `ensureRevenueCatReady()`.
- O efeito que faz `loginToRevenueCat(user.id)` também deve usar esse mesmo guard.
- Assim nenhum caminho consegue chamar o SDK “cru” antes da configuração nativa estar pronta.

4. Endurecer o controller nativo
- Em `ios/App/App/MyViewController.swift`, ajustar o override para chamar `super.capacitorDidLoad()` antes/depois do registro manual do plugin customizado.
- Isso reduz o risco de interferir no bootstrap padrão dos plugins do Capacitor, incluindo o plugin `Purchases`.

5. Melhorar diagnóstico sem mascarar falhas
- Adicionar logs claros no hook:
  - plataforma detectada,
  - resultado de `isConfigured()`,
  - momento exato do `configure`,
  - primeira chamada que falhou.
- Manter toasts para o usuário, mas com causa mais útil quando o SDK ainda não estiver pronto.

Arquivos envolvidos:
- `src/hooks/useRevenueCat.ts`
- `ios/App/App/MyViewController.swift`

Resultado esperado:
- `Purchases.getOfferings()` só roda depois de o plugin confirmar configuração real.
- O botão “Assinar via App Store” deixa de cair no erro “Purchases must be configured before calling this function”.
- O fluxo fica estável mesmo com múltiplos componentes usando `useRevenueCat()` ao mesmo tempo.

Detalhe técnico importante:
Hoje o projeto tem pelo menos dois pontos consumindo `useRevenueCat()` (`AuthCard` e `SubscriptionRequired`). Isso aumenta a chance de corrida de inicialização. A correção principal é centralizar a inicialização numa rotina única e verificar `Purchases.isConfigured()` em vez de depender de estado local do hook.
