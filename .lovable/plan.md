## Objetivo

Substituir o card simples de cada quiz na aba "Disponíveis" (`/quiz`) pela direção **Gamified Quest Card**, mantendo todos os dados e comportamento atuais.

## Onde

- `src/pages/Quiz.tsx`, dentro do `quizzes.map(...)` (atual `<Card>` em ~linha 146).

## O que muda visualmente

- Wrapper externo `bg-[#FFD1E7] rounded-[32px] p-1` com sombra rosa suave; interior `bg-white/40 rounded-[28px] p-5 backdrop-blur-sm border border-white/50` (efeito glass dentro do card rosa).
- **Topo**: chip branco com o `theme` (uppercase, tracking) à esquerda; chip rosa `#FD46A1` "+XP" à direita com pontinho pulsando. O valor de XP será derivado do nº de perguntas (`questionCounts[q.id] * 10`, fallback 50). Usuários Pro ganham `×1,25` (texto "+50 XP" → "+62 XP" automaticamente).
- **Conteúdo**: título em `text-xl font-bold text-[#FD46A1]` + descrição `text-sm text-muted-foreground line-clamp-2`.
- **Stats grid (3 colunas)**: Nível (dificuldade traduzida: facil/medio/dificil → Fácil/Médio/Difícil), Total (`N Perg.`), Tempo (`Xs`). Cada cell `bg-white/60 rounded-2xl p-2`, com bordas verticais brancas na do meio.
- **Footer**: à esquerda, badge `Concluído` (verde com check) somente quando `done === true`; quando não feito, badge branca com pontinho verde pulsando + "Disponível". À direita, botão circular‑quadrado `w-12 h-12 bg-[#FD46A1] rounded-2xl` com seta → (CTA visual; o card inteiro continua clicável chamando `play(q.id)`).
- Animação: `transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`.

## O que NÃO muda

- Comportamento: o card inteiro continua chamando `play(q.id)` no clique (o botão de seta não tem `onClick` próprio, herda o do card via `pointer-events`).
- Dados exibidos: `q.title`, `q.description`, `q.theme`, `q.difficulty`, `questionCounts[q.id]`, `q.time_per_question_seconds`, estado `done`.
- Estrutura da página, abas, ranking, header, etc.
- Sem alterações em backend, edge functions ou banco.
- Sem novas dependências; usa apenas Tailwind + ícones já em uso (`lucide-react`: `Check`, `ArrowRight` ou `Zap`).

## Notas técnicas

- Capitalização da dificuldade via pequeno helper local `formatDifficulty(d)`.
- Nada de ícone decorativo no título principal? A regra "títulos de cards SEM ícones" se aplica a cards genéricos; aqui o título permanece sem ícone — os ícones aparecem só nos chips do topo/footer (gamificação), respeitando a regra.
- Manter `text-base` mínimo onde houver risco de zoom iOS (não há inputs neste card).
- Acessibilidade: adicionar `role="button"` e `aria-label={`Jogar quiz ${q.title}`}` no wrapper.

## Verificação

- Build automático do Lovable.
- Visual no preview mobile (390px) confirmando layout, contraste e estado `done` vs `disponível`.
