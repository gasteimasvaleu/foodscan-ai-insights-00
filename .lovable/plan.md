# Efeito Pulsante Neon no ToAquiPromoCard

## Objetivo
Adicionar um efeito de borda pulsante neon na cor `#FD46A1` (rosa primário do app) no card promocional do Tô Aqui (`ToAquiPromoCard.tsx`).

## Implementação

### 1. Adicionar keyframe de pulsação neon em `src/index.css`
Criar um `@keyframes` chamado `neon-pulse` que varie o `box-shadow` da cor primária entre estados de brilho intenso e suave:
- **0%, 100%**: `box-shadow: 0 0 5px #FD46A1, 0 0 10px #FD46A1, 0 0 15px #FD46A1`
- **50%**: `box-shadow: 0 0 10px #FD46A1, 0 0 20px #FD46A1, 0 0 30px #FD46A1`

### 2. Aplicar animação no componente
Em `src/components/ToAquiPromoCard.tsx`:
- Adicionar `animate-[neon-pulse_2s_ease-in-out_infinite]` (ou classe utilitária equivalente) no elemento `<Link>` principal do card.
- Garantir que a borda/arredondamento (`rounded-3xl`) permaneça intacto.
- Adicionar `border border-[#FD46A1]/50` para dar base visual à borda neon.

### 3. Verificar responsividade
- Confirmar que o efeito não quebra o layout mobile (viewport 390x609).
- O card já é `w-full` com `aspect-[21/9]` — a animação de sombra não afeta dimensões.

## Fora do escopo
- Nenhuma mudança em outros cards (`NoveltyCard`, etc.) a menos que solicitado.
- Nenhuma mudança de funcionalidade ou lógica — apenas estilo visual.

## Arquivos alterados
- `src/index.css` — novo keyframe `neon-pulse`
- `src/components/ToAquiPromoCard.tsx` — classes de animação e borda