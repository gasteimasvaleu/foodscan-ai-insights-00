## Plano
Adicionar confetti rosa ao montar a `QuizResult` para celebrar a conclusão do quiz.

## Mudanças

1. **Instalar dep**: `canvas-confetti` + `@types/canvas-confetti` (lib leve, ~6kb gz, sem dependências).

2. **`src/pages/QuizResult.tsx`**:
   - Importar `confetti from "canvas-confetti"`.
   - Em um `useEffect` disparado após `attempt` carregar com sucesso, disparar confetti em paleta rosa da marca:
     - Cores: `["#FD46A1", "#FF6FB3", "#FFD1E7", "#ffffff"]`.
     - Burst principal centralizado: `particleCount: 120, spread: 80, startVelocity: 45, origin: { y: 0.35 }`.
     - Dois bursts laterais com leve delay (200ms / 400ms) vindos das bordas para efeito mais rico.
     - Se `attempt.is_perfect`, intensificar (mais partículas + um terceiro burst).
   - Disparar **uma única vez** por montagem (guard com ref booleana, evita re-disparo em re-renders/HMR).

## Fora do escopo
- Lógica de score, UI do card, outras páginas. Sem som.
