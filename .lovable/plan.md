## Objetivo
Substituir o `Loader` (loader-15) usado no splash do iOS nativo por um novo componente `KineticDotsLoader` — 4 bolinhas com bounce gravitacional, squash & stretch, ripple no impacto e sombra reativa.

## Alterações

**1. Criar `src/components/ui/kinetic-dots-loader.tsx`**
- Component default export `KineticDotsLoader`
- Props opcionais: `color` (default branco para contrastar no splash preto) e `size`
- 4 dots com `animation-delay` escalonado (0s, 0.15s, 0.3s, 0.45s)
- Para cada dot, uma "cena" com:
  - **Bola**: `gravity-bounce` (translateY) + camada interna `rubber-morph` (squash/stretch) + highlight especular
  - **Ripple**: `ripple-expand` (círculo com borda que expande no impacto)
  - **Sombra**: `shadow-breathe` (escala/opacidade conforme altura)
- Keyframes definidos via `<style>` tag inline (exatamente os 4 keyframes que você passou: gravity-bounce, rubber-morph, shadow-breathe, ripple-expand) — duração comum ~1.2s, infinite

**2. Editar `src/components/SplashScreen.tsx`**
- Trocar `import Loader from '@/components/ui/loader-15'` por `import KineticDotsLoader from '@/components/ui/kinetic-dots-loader'`
- Trocar `<Loader size={64} />` por `<KineticDotsLoader />` no `NativeIOSSplash` (linha ~108)

## Fora de escopo
- WebSplash (vídeo) permanece inalterado
- Não removo o `loader-15` (pode estar em uso em outros lugares)
- Outros loaders do app não mudam