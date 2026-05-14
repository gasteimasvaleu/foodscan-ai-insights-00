## Diagnóstico

A `src/pages/QuizResult.tsx` está fora do padrão visual do app:
- Background `bg-[#F7FAFB]` plano (sem gradiente / sem hero), enquanto Quiz.tsx e QuizPlay.tsx têm `<Navbar />` (perfil) no topo — aqui ele não é renderizado.
- Card de resultado é estático: número grande sem animação, sem progresso visual, sem hierarquia, sem celebração.
- Botões "Ver ranking" / "Início" genéricos.

## Mudanças em `src/pages/QuizResult.tsx`

### 1. Adicionar Navbar de perfil (consistência com Quiz/QuizPlay)
- Importar `Navbar` de `@/components/Navbar` e renderizar `<Navbar />` no topo do retorno, igual Quiz.tsx faz. A `TubelightNavbar` global (bottom) já aparece automaticamente.

### 2. Hero card de pontuação animado
Substituir o card atual por um card "wow" com:
- Background gradient da marca: `bg-gradient-to-br from-[#FD46A1] via-[#FF6FB3] to-[#FF9DCB]`, `rounded-3xl`, `shadow-xl`, `text-white`, `overflow-hidden relative`.
- Glow decorativo: 2 blobs absolutos `bg-white/20 blur-3xl` para profundidade.
- Ícone Trophy em chip circular `bg-white/20 backdrop-blur-md` com `animate-scale-in`.
- **Pontuação animada com `useCountUp`** (já existe em `src/hooks/useCountUp.ts`): número grande (`text-7xl font-bold tabular-nums`) contando de 0 até `attempt.score` em ~1500ms.
- Linha "X de Y corretas" como chip branco translúcido (`bg-white/20 rounded-full px-3 py-1 text-sm`).
- **Barra de progresso de acertos** (`correct_count / total_questions`): track `bg-white/20`, fill `bg-white` com `transition-all duration-1000` animando a largura ao montar (state que vai de 0 a %).
- Badge "Quiz perfeito! 🎉" com `animate-fade-in` se `is_perfect`.
- Badge "Bônus Pro ×1,25 aplicado" com ícone Crown se `isPro`.

### 3. Card de upsell Pro (quando não é Pro)
Manter mas refinar:
- `bg-white rounded-3xl border-0 shadow-sm`, ícone Crown `text-[#FD46A1]`, mensagem mais clara, botão pill `#FD46A1`.

### 4. Card "compartilhar / próximos passos"
Trocar a row de 2 botões por:
- Botão primário grande "Jogar outro quiz" → `/quiz` (`bg-[#FD46A1] text-white rounded-full h-12 w-full`).
- Botão secundário texto "Ver ranking completo" → `/quiz` aba ranking (link sutil, `text-[#FD46A1] underline-offset-4`).
- Botão ghost "Voltar para o início" → `/`.

### 5. Container / padrão visual
- Manter `min-h-screen bg-[#F7FAFB] pb-28 pt-[calc(env(safe-area-inset-top)+4rem)]`.
- `max-w-md mx-auto px-4 space-y-4` mantido.
- Wrapper interno com `animate-fade-in`.

### 6. Loading / empty
- Trocar texto cru por mesmo padrão Pink do app (spinner simples ou skeleton com `bg-[#FFD1E7]`).

## Detalhes técnicos

- `useCountUp(end, duration)` retorna `number` (float). Usar `Math.round(count)` no JSX.
- Barra de progresso: `useEffect` que após mount seta `setProgress((correct/total)*100)` para disparar a transição CSS.
- Sem mudança em rotas, edge functions, schema ou lógica de cálculo de score / bônus Pro — só apresentação.
- Mantém props/queries existentes (`quiz_attempts` por `quiz_id` + `user_id`).

## Fora do escopo

- Lógica de ranking, cálculo de bônus, edge functions de quiz.
- QuizPlay e Quiz (lista/ranking).
