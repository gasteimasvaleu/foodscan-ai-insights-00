# Streak badge na Home

Adicionar um indicador visível da sequência diária (🔥 N) no topo da Home, trazendo a gamificação que hoje fica escondida em `/conquistas`.

## Onde

`src/pages/Index.tsx`, dentro do bloco já logado, como primeiro filho do `space-y-6` (acima do `AuthCard`). Renderiza só quando `user` existe.

## Componente novo

`src/components/StreakBadge.tsx`:

- Lê `user_streaks.current_streak` e `longest_streak` para o `user.id`.
- Subscription realtime (`postgres_changes` em `user_streaks`) para atualizar ao vivo quando o trigger de `meal_records` incrementar — com cleanup correto via `removeChannel`.
- Animação pop (scale 1 → 1.3 → 1, 400ms) ao detectar incremento.
- Clica → navega para `/conquistas`.
- Estados visuais:
  - `current_streak > 0`: pill com 🔥 + número + texto "dias seguidos".
  - `current_streak === 0`: pill discreta com 🔥 + "Comece sua sequência hoje".
- Estilo: glassmorphism (bg-white/70, backdrop-blur-md, rounded-full), borda sutil em `#FD46A1/20`, altura compacta (~44px), full-width com conteúdo centralizado-esquerda.
- Não renderiza nada enquanto está carregando (evita flicker).

## Sem mudanças de DB

Tabela `user_streaks` já existe (memória `mem://features/gamification/streaks-badges`). Trigger em `meal_records` já popula.

## Esforço

~30min, 2 arquivos (novo `StreakBadge.tsx` + edit em `Index.tsx`).
