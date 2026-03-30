

## Corrigir rejeição App Store: Login com Apple + Vídeos

Sim, o fluxo que você descreveu está correto e é a abordagem ideal para compliance com a Apple. Vou detalhar o plano completo incluindo também a correção dos vídeos (segundo bug reportado).

### Fluxo revisado

```text
App abre → Tela de Login (Apple Sign In sempre habilitado)
  → Login → Verifica assinatura (apenas iOS nativo)
    → Sem assinatura → PaywallScreen (compra/restaurar)
    → Com assinatura → App normal
  → Web: pula verificação → App normal
```

### Alterações

**1. `src/components/AuthCard.tsx` — Simplificar tela de login iOS**
- Remover `disabled={!hasPurchased}` do `AppleSignInButton` (linha 245)
- Remover texto condicional "Assine primeiro abaixo..." (linhas 246-249)
- Remover bloco de compra/assinatura (botão "Assinar via App Store", preço, separador) — linhas 252-263
- Manter: Apple Sign In (sempre habilitado), formulário email/senha, "Restaurar Compras", textos legais
- Remover imports e estado de `purchaseMonthly`, `getSubscriptionPrice`, `checkSubscriptionStatus`, `hasPurchased`, `price` já que a compra sai da tela de login

**2. Novo arquivo: `src/components/PaywallScreen.tsx`**
- Mover toda a lógica de compra para este componente dedicado
- Exibir: logo, preço (via `getSubscriptionPrice`), lista de benefícios, botão "Assinar via App Store", "Restaurar Compras", textos legais
- Após compra bem-sucedida: chamar `syncSubscriptionAfterLogin` e liberar acesso (reload ou callback)
- Estilo visual consistente com o card rosa existente

**3. `src/pages/Index.tsx` — Adicionar verificação de paywall**
- Após login (user existe), se `isNativeIOS`:
  - Verificar `subscription.subscriptionStatus.subscribed`
  - Se não assinante → renderizar `<PaywallScreen />`
  - Se assinante → renderizar app normal (`QuickActions`, etc.)
- No web: manter fluxo atual sem paywall

**4. `src/components/VideoModal.tsx` — Corrigir validação de URL**
- Alterar `isValidUrl` para aceitar qualquer URL válida (remover filtro por domínio/extensão)
- Adicionar `h-full` ao iframe do YouTube (linha 80)
- Adicionar `onError` handler no `<video>` com fallback "Abrir externamente"

**5. `src/pages/Treinos.tsx` — Corrigir validação de URL**
- Alterar `isValidVideoUrl` (linha 99-107) para aceitar qualquer URL válida
- Remover filtro por extensão/domínio

**6. `ios/App/App.xcodeproj/project.pbxproj`**
- Incrementar `CURRENT_PROJECT_VERSION` de `10` para `11`

### Detalhes técnicos

- O `PaywallScreen` recebe `user` e `onSubscribed` como props
- A verificação de assinatura usa o hook `useAuth` que já expõe `subscription.subscriptionStatus.subscribed`
- No `Index.tsx`, o fluxo fica: `!user` → AuthCard, `user && !subscribed && isNativeIOS` → PaywallScreen, caso contrário → app normal
- O `SubscriptionRequired` existente continua funcionando para rotas individuais como fallback

