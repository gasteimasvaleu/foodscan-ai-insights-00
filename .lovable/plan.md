

## Limpeza web-only: manter auth e tokens, remover PWA e Stripe

### O que será removido

1. **Componentes PWA**: `PWAInstallPrompt`, `PWAOfflineIndicator`, `usePWA` hook
2. **Rotas Stripe/web-only**: `/quero-assinar`, `/payment-success`, `/payment-cancel` e o wrapper `WebOnlyRoute`
3. **Páginas Stripe**: `PaymentSuccess.tsx`, `PaymentCancel.tsx`, `Subscription.tsx`
4. **Componentes Stripe**: `SubscriptionPlans.tsx`, `SubscriptionStatus.tsx`, `PaymentRegistrationForm.tsx`
5. **Referências na Navbar**: remover item "Assinatura" do menu
6. **Arquivos PWA públicos**: `public/sw.js`, `public/manifest.json`, `public/offline.html`, `public/aimtell-worker.js`
7. **Edge functions Stripe**: `create-checkout`, `customer-portal` (se existirem como arquivos)
8. **Funções Stripe no useSubscription**: remover `createCheckout` e `openCustomerPortal`

### O que será MANTIDO

- **Auth page** (`src/pages/Auth.tsx`): login/senha + tabs Entrar/Cadastrar intactas
- **AuthCard** (`src/components/AuthCard.tsx`): inputs de email/senha em ambos os fluxos (iOS e web)
- **Token flow**: toda a lógica de `validate-token`, `activate-subscription`, fluxo Hotmart com token na URL
- **Edge functions de token**: `validate-token/index.ts`, `activate-subscription/index.ts`
- **AppleSignInButton**: mantida
- **SubscriptionRequired**: mantida mas ajustada (remover redirect para `/quero-assinar`, manter apenas fluxo RevenueCat)

### Alterações por arquivo

**`src/App.tsx`**
- Remover imports: `Subscription`, `PaymentSuccess`, `PaymentCancel`
- Remover componente `WebOnlyRoute`
- Remover rotas: `/quero-assinar`, `/payment-success`, `/payment-cancel`

**`src/pages/Index.tsx`**
- Remover imports e uso de `PWAInstallPrompt` e `PWAOfflineIndicator`

**`src/components/Navbar.tsx`**
- Remover item de menu "Assinatura" (`/quero-assinar`)

**`src/components/SubscriptionRequired.tsx`**
- Remover fallback `window.location.href = '/quero-assinar'`; manter apenas `purchaseMonthly()` do RevenueCat

**`src/hooks/useSubscription.ts`**
- Remover funções `createCheckout` e `openCustomerPortal` que chamam edge functions Stripe
- Manter `checkSubscription` e estado de subscription

**Deletar arquivos**:
- `src/components/PWAInstallPrompt.tsx`
- `src/components/PWAOfflineIndicator.tsx`
- `src/hooks/usePWA.ts`
- `src/pages/PaymentSuccess.tsx`
- `src/pages/PaymentCancel.tsx`
- `src/pages/Subscription.tsx`
- `src/components/SubscriptionPlans.tsx`
- `src/components/SubscriptionStatus.tsx`
- `src/components/PaymentRegistrationForm.tsx`
- `public/sw.js`, `public/manifest.json`, `public/offline.html`, `public/aimtell-worker.js`

**Manter intactos**:
- `src/pages/Auth.tsx` (login + cadastro + token Hotmart)
- `src/components/AuthCard.tsx` (login nativo + web)
- `supabase/functions/validate-token/index.ts`
- `supabase/functions/activate-subscription/index.ts`
- `supabase/functions/hotmart-webhook/index.ts`

