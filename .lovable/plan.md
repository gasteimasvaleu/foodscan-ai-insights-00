

## Hide Stripe/Hotmart payment pages on native iOS

**Context**: No iOS nativo, as assinaturas são gerenciadas via RevenueCat/In-App Purchase. As páginas `/quero-assinar`, `/payment-success` e `/payment-cancel` pertencem ao fluxo web (Hotmart) e não devem ser exibidas no iOS nativo.

### Changes

1. **`src/App.tsx`** — Wrap the three routes (`/quero-assinar`, `/payment-success`, `/payment-cancel`) in a conditional that checks `Capacitor.getPlatform() !== 'ios'` (or uses `useNativePlatform`). On native iOS, redirect these routes to `/` (home).

2. **`src/components/Navbar.tsx`** — Hide the "Assinatura" menu item (`/quero-assinar`) when on native iOS.

3. **`src/components/SubscriptionRequired.tsx`** — On native iOS, change the button to trigger the RevenueCat paywall instead of navigating to `/quero-assinar`.

4. **`src/pages/PaymentSuccess.tsx`** — Remove the link to `/quero-assinar` or make it platform-aware.

5. **`src/pages/PaymentCancel.tsx`** — Same: hide or redirect on native iOS.

### Technical detail

- Use `useNativePlatform()` hook (already exists) to detect iOS native
- For routes in `App.tsx`, create a wrapper component that redirects to `/` on native iOS using `<Navigate to="/" />`
- The RevenueCat hook (`useRevenueCat.ts`) already exists for native purchase flow

