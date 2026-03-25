

## Corrigir Safe Area da Navbar Superior

### Problema
A Navbar usa `style={{ paddingTop: 'env(safe-area-inset-top)' }}` como inline style do React. `env()` CSS **não funciona em inline styles** — o React trata como string literal. Por isso o padding é ignorado e a navbar fica atrás da status bar.

### Solução

**1. Navbar.tsx** — Trocar inline style por classe Tailwind + hardware acceleration:

```tsx
<nav 
  className="fixed top-0 left-0 right-0 z-50 bg-[#FA1690]/85 backdrop-blur-md border-b border-white/20 shadow-sm pt-[env(safe-area-inset-top)]"
  style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform' }}
>
```

**2. Todas as páginas com conteúdo** — Trocar `pt-16`, `pt-20` e inline `paddingTop` por `pt-[calc(env(safe-area-inset-top)+4rem)]`:

| Página | De | Para |
|--------|-----|------|
| `Index.tsx` | `style={{ paddingTop: 'calc(...)' }}` | classe `pt-[calc(env(safe-area-inset-top)+4rem)]` |
| `FoodScan.tsx` (3x) | `pt-16` | `pt-[calc(env(safe-area-inset-top)+4rem)]` |
| `DailyControl.tsx` (3x) | `pt-16` | `pt-[calc(env(safe-area-inset-top)+4rem)]` |
| `MasterCheFIT.tsx` (3x) | `pt-16` | `pt-[calc(env(safe-area-inset-top)+4rem)]` |
| `Treinos.tsx` (2x) | `pt-16` | `pt-[calc(env(safe-area-inset-top)+4rem)]` |
| `Profile.tsx` | `pt-20` | `pt-[calc(env(safe-area-inset-top)+5rem)]` |
| `About.tsx` | `pt-20` | `pt-[calc(env(safe-area-inset-top)+5rem)]` |
| `Subscription.tsx` | `pt-20` | `pt-[calc(env(safe-area-inset-top)+5rem)]` |
| `PaymentCancel.tsx` | `pt-20` | `pt-[calc(env(safe-area-inset-top)+5rem)]` |
| `WorkoutPlan.tsx` (2x) | `pt-20` | `pt-[calc(env(safe-area-inset-top)+5rem)]` |
| `PhysicalAssessment.tsx` (2x) | `pt-20` | `pt-[calc(env(safe-area-inset-top)+5rem)]` |
| `ServiNUTRI.tsx` | verificar | ajustar |
| `MyDiets.tsx` | verificar | ajustar |
| `WhatsAppSettings.tsx` | verificar | ajustar |
| `FitTracker.tsx` | verificar | ajustar |

**Nenhuma alteração no TubelightNavbar.**

### Após implementar
1. `npm run build`
2. `npx cap sync ios`
3. Rodar no Xcode

