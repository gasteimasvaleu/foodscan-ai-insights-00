# Quizzes com IA — Plano de Implementação

## Visão geral
Nova feature de quizzes interativos para todos os usuários logados. Admin gera quizzes via IA (Lovable AI Gateway), revisa, edita e publica. Usuários respondem 1 vez por quiz, ganham pontos (acerto + velocidade + bônus de quiz perfeito + multiplicador Pro) e disputam rankings semanal, mensal e all-time. Estrutura preparada para evoluir com streaks e badges depois.

## Rotas e navegação

- `/quiz` — lista de quizzes ativos + ranking (acesso: usuário logado, sem ProRoute)
- `/quiz/:id` — execução do quiz (uma pergunta por vez, timer)
- `/quiz/:id/resultado` — resultado da tentativa + posição no ranking
- `/admin/quiz` — listagem admin (rascunhos / publicados / arquivados)
- `/admin/quiz/novo` — gerador IA + editor manual
- `/admin/quiz/:id` — editar quiz existente

Adicionar card "Quizzes" no `/admin` (AdminDashboard). **Entrada apenas no Menu Mais** (não entra em Quick Actions).

## Banco de dados (migration)

Tabelas em `public`:

- **quizzes** — `id`, `title`, `description`, `theme` (nutrição/hidratação/treino/maternidade/geral), `difficulty` (fácil/médio/difícil), `time_per_question_seconds` (default 20), `status` (draft/published/archived), `published_at`, `created_by` (uuid → profiles), `created_at`, `updated_at`
- **quiz_questions** — `id`, `quiz_id`, `position`, `prompt`, `options` (jsonb array de 4 strings), `correct_index` (0-3), `explanation` (opcional)
- **quiz_attempts** — `id`, `quiz_id`, `user_id`, `started_at`, `finished_at`, `score`, `correct_count`, `total_questions`, `total_time_ms`, `is_perfect`, `pro_bonus_applied` (bool). Unique (`quiz_id`, `user_id`).
- **quiz_attempt_answers** — `id`, `attempt_id`, `question_id`, `chosen_index`, `is_correct`, `time_ms`, `points_awarded`

RLS:
- `quizzes` / `quiz_questions`: select público quando `status='published'`; admin (has_role) full.
- `quiz_attempts` / `quiz_attempt_answers`: usuário lê/cria/atualiza só os próprios; admin lê tudo.
- `correct_index` e `explanation` **não** podem vazar antes da resposta → criar **view** `quiz_questions_public` (sem `correct_index`/`explanation`); validação acontece em edge function.

Índices: `quiz_attempts(user_id)`, `quiz_attempts(quiz_id, score desc)`, `quiz_questions(quiz_id, position)`.

Função SQL `get_quiz_ranking(period text)` — retorna top 50 por janela: `weekly` / `monthly` / `all_time`. Join com `profiles` (nome/avatar) e `subscribers` para flag `is_pro` no ranking (ícone de coroa).

## Edge functions

- **`quiz-generate`** (admin) — `{ theme, difficulty, num_questions }` → Lovable AI Gateway (`google/gemini-2.5-flash`, json_schema). Não persiste — admin edita e salva.
- **`quiz-start-attempt`** — cria `quiz_attempts` (rejeita se já existe). No insert, consulta `subscribers` para definir `pro_bonus_applied = subscribed`.
- **`quiz-submit-answer`** — `{ attempt_id, question_id, chosen_index, time_ms }`. Valida JWT, busca `correct_index` server-side, calcula:
  - acerto base = 100
  - bônus velocidade = `round(100 * max(0, (limite_ms - time_ms) / limite_ms))`
  - **multiplicador Pro = ×1.25** se `attempt.pro_bonus_applied` (consultado do attempt, não confiando no client)
  - retorna `{ is_correct, correct_index, explanation, points_awarded }`
- **`quiz-finish-attempt`** — calcula totais, `is_perfect` se 100% acertos → +500 pts (também ×1.25 se Pro). Atualiza `quiz_attempts.score`.

JWT verificado em todas; `quiz-generate` checa `has_role(admin)`.

## Pontuação (resumo)
- Acerto base: 100 pts
- Bônus velocidade: até +100 pts (linear pelo tempo restante)
- Quiz perfeito: +500 pts
- **Bônus Pro (assinantes em `subscribers.subscribed=true`): ×1.25 sobre o total final**
- Score do quiz = soma; ranking soma scores no período.

UI deixa explícito: cards/banner "Assinantes Pro ganham 25% a mais de pontos" para incentivar conversão. Ranking exibe ícone de coroa ao lado de Pros.

## Frontend

### Usuário (`/quiz`)
- Header padrão (gradient + título "Quiz" #FD46A1).
- Banner discreto: "Pro: +25% pontos · [Assinar]" (esconde se já Pro).
- Tabs: "Disponíveis" / "Respondidos" / "Ranking".
- Cards rosa (`#FFD1E7`, `rounded-3xl`, `text-base`, sem ícones decorativos) com tema, dificuldade, nº perguntas, tempo, status (✓ se respondido).
- Ranking: sub-tabs Semanal / Mensal / Geral; pódio top 3 + lista; coroa em Pros; destaca posição do usuário.

### Execução (`/quiz/:id`)
- Tela cheia, barra de progresso, timer circular, 4 botões grandes.
- Submit por pergunta → feedback verde/vermelho + explicação → próximo automático em 2s.
- Final: chama finish → redireciona para resultado.

### Resultado
- Score grande, breakdown (acertos, tempo, bônus perfeito, multiplicador Pro). CTA "Ver ranking" / "Compartilhar no WhatsApp". Para não-Pro: "Você teria X pts a mais com Pro · Assinar".

### Admin (`/admin/quiz`, `/admin/quiz/novo`)
- Lista com filtros draft/published/archived; ações editar/publicar/arquivar/duplicar.
- Editor: título, descrição, tema (Select), dificuldade (Select), tempo por pergunta. Botão "Gerar com IA" → modal (tema/dificuldade/qtd) → preenche perguntas. Cada pergunta editável (texto, 4 opções, marca correta, explicação opcional), drag para reordenar. Salvar rascunho / Publicar.
- Card "Quizzes" no array `adminPages` de `AdminDashboard.tsx`.

### Menu Mais
- Adicionar item "Quizzes" no Menu Mais (bottom plus). **Não** adicionar em Quick Actions.

## Preparação para futuro (streaks e badges)
- Tabelas com timestamps suficientes para calcular streaks depois. Sem novas tabelas agora.

## Convenções técnicas
- Lovable AI Gateway via `LOVABLE_API_KEY` (já existente), `google/gemini-2.5-flash` com `response_format: json_schema`.
- Tokens semânticos do design system; cores HSL.
- Cards: `bg-[#FFD1E7]`, `rounded-3xl`, `text-base`, sem ícones decorativos no título.
- Páginas internas: `pt-[calc(env(safe-area-inset-top)+4rem)]`, `pb-28`.
- Modais glassmorphism (`bg-white/70`, `backdrop-blur-md`), botão X `#FD46A1`.
- Inputs `text-base` (anti-zoom iOS); sem Drawers em Dialogs.

## Escopo desta entrega
1. Migration (tabelas, RLS, view pública, função de ranking).
2. 4 edge functions (com lógica de bônus Pro server-side).
3. Páginas admin (lista + editor com gerador IA).
4. Páginas usuário (lista + execução + resultado + ranking).
5. Card no AdminDashboard + entrada no Menu Mais.
6. Sem streaks/badges ainda.
