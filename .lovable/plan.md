## Deixar fundo do LoadingOverlay bem mais transparente

O blur forte (`backdrop-blur-2xl`) estava mascarando a translucidez. Vou reduzir a opacidade e o blur.

### Mudança em `src/components/VideoOverlay.tsx`

- `bg-white/40 backdrop-blur-2xl` → `bg-white/15 backdrop-blur-sm`
- Vinheta rosa: reduzir mais ainda pra não compensar a transparência:
  `rgba(253,70,161,0.14) 75%, rgba(253,70,161,0.28) 100%` → `rgba(253,70,161,0.08) 75%, rgba(253,70,161,0.18) 100%`

Resultado: dá pra ver claramente a UI atrás, com leve véu branco e um toque de rosa nas bordas.
