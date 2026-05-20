## Objetivo
Remover a faixa branca atrás da navbar tubelight para que ela pareça flutuante, e adicionar uma sombra branca sutil ao redor para destaque.

## Alterações

**Arquivo:** `src/components/ui/tubelight-navbar.tsx`

1. **Remover a faixa branca** (linha 108):
   ```tsx
   <div className="absolute inset-x-0 -top-3 -bottom-2 bg-white -z-10" />
   ```
   Esta div cria o fundo branco sólido atrás da navbar.

2. **Adicionar halo/sombra branca sutil** no container da navbar (linha ~117, no `style.boxShadow`):
   - Manter as sombras existentes (profundidade + inset highlights)
   - Adicionar um glow branco externo fino, ex.:
     `0 0 0 1px rgba(255,255,255,0.6), 0 0 16px rgba(255,255,255,0.45)`
   - Resultado: contorno branco delicado + brilho suave ao redor, mantendo o visual glassmorphism rosa.

## Fora de escopo
- Cores, ícones, items da navbar
- Layout interno da navbar
- Outras páginas/componentes