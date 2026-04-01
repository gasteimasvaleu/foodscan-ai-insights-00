

## Corrigir padding superior da página WidgetGuide

### Problema
A página usa `pt-6` no container principal, enquanto o padrão do app é `pt-[calc(env(safe-area-inset-top)+4rem)]` para compensar a Navbar fixa e a safe area do iOS.

### Alteração
- **`src/pages/WidgetGuide.tsx`** (linha 32): trocar `pt-6` por `pt-[calc(env(safe-area-inset-top)+4rem)]` no container principal.

