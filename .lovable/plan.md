## Tornar fundo do LoadingOverlay translúcido

Reduzir a opacidade do fundo branco para que a UI por trás fique levemente visível durante o loading.

### Mudança em `src/components/VideoOverlay.tsx`

- Base: `bg-white/95` → `bg-white/40`
- Reforçar o blur: `backdrop-blur-xl` → `backdrop-blur-2xl` (mantém legibilidade do texto e do spinner mesmo com fundo translúcido)
- Vinheta rosa: manter, mas reduzir levemente a intensidade para combinar com a base mais leve:
  `rgba(253,70,161,0.18) 75%, rgba(253,70,161,0.35) 100%` → `rgba(253,70,161,0.14) 75%, rgba(253,70,161,0.28) 100%`

### Fora de escopo
- Spinner, textos, animações — mantidos.
- API do componente — inalterada.
