# Streaks & Badges (Gamificação) — WeDiet

Vou adaptar a sugestão à nossa stack (React + Supabase) e às convenções já em uso no app (Quiz, Pro bonus, RLS, edge functions).

## Visão geral
- **Streak diário**: incrementa quando o usuário tem "atividade válida" no dia.
- **Badges**: catálogo de conquistas desbloqueadas automaticamente por triggers/edge function.
- **Localização na UI**: novo card de "Sequência" no Dashboard (apenas visualização compacta) + página `/conquistas` acessível via Menu **Mais** (mesmo padrão do Quiz). Sem entrada nos Quick Actions.

## Definição de "atividade válida"
Para o app WeDiet, registrar **pelo menos 1 refeição em `meal_records` no dia** (timezone America/Sao_Paulo). Simples, evita penalizar usuários que não atingem meta exata e já é o evento mais comum.

Bônus futuro (não nesta entrega): bater meta de calorias/proteína = badge específico.

## Modelagem de dados

### `user_streaks` (1 linha por usuário)
- `user_id uuid PK` → `profiles(id)`
- `current_streak int default 0`
- `longest_streak int default 0`
- `last_activity_date date` (em BRT)
- `streak_freezes int default 0` (Pro: ganha 1/mês até máx 3)
- `updated_at timestamptz`

### `badges` (catálogo, seed inicial)
- `id uuid PK`
- `code text unique` (ex: `streak_7`, `streak_30`, `meals_100`, `quiz_perfect_5`, `hydration_7`)
- `name text`, `description text`, `icon text` (emoji ou nome lucide), `tier text` (bronze/prata/ouro)
- `condition_type text` (`streak_days`, `total_meals`, `quiz_perfect_count`, `hydration_streak`)
- `condition_value int`
- `is_active bool default true`

### `user_badges`
- `user_id uuid`, `badge_id uuid`, `unlocked_at timestamptz`
- PK composto `(user_id, badge_id)`

### Seed de badges iniciais
- Streak: 3, 7, 14, 30, 60, 100 dias
- Refeições registradas: 10, 50, 100, 365
- Quiz perfeito: 1, 5, 25 (integra com sistema atual)
- Hidratação 7 dias seguidos batendo meta

## Lógica (backend)

### Trigger Postgres em `meal_records` (after insert)
Função `update_user_streak(_user_id)` SECURITY DEFINER:
1. Calcula `today` em America/Sao_Paulo.
2. Lê `user_streaks`. Se não existe, cria com `current_streak=1`.
3. Se `last_activity_date = today` → no-op.
4. Se `last_activity_date = today - 1` → `current_streak += 1`.
5. Se gap > 1 dia:
   - Se `streak_freezes > 0` e gap = 2 → consome 1 freeze, mantém streak.
   - Caso contrário, reseta para 1.
6. Atualiza `longest_streak = greatest(longest_streak, current_streak)`.
7. Chama `check_and_unlock_badges(_user_id)`.

`check_and_unlock_badges` faz INSERT ... ON CONFLICT DO NOTHING para cada badge cuja condição foi atingida (streak/refeições/quiz). Retorna lista de novos badges desbloqueados (consultada pelo frontend via realtime ou refetch).

### Pg_cron diário (03:00 BRT) — opcional fase 2
- Quebra streaks de quem não registrou ontem (apenas para refletir no UI imediatamente; não estritamente necessário pois o cálculo é lazy na próxima atividade).
- Concede 1 streak_freeze/mês para assinantes Pro (consulta `subscribers.subscribed`).

### Realtime
Habilitar realtime em `user_badges` para mostrar toast "🏅 Conquista desbloqueada: …" quando um novo registro chega ao usuário logado.

## RLS
- `user_streaks`: SELECT/UPDATE somente `auth.uid() = user_id`. INSERT pelo trigger (SECURITY DEFINER bypassa).
- `badges`: SELECT público (catálogo). INSERT/UPDATE/DELETE apenas admin.
- `user_badges`: SELECT somente próprio. INSERT pelo trigger.

## Frontend

### Página `/conquistas` (nova)
- Header padrão (gradiente, título #FD46A1 — segue `mem://style/page-headers`).
- Card "Sequência atual" (#FFD1E7, rounded-3xl, sem ícone decorativo no título — segue `mem://style/ui-cards`):
  - Número grande, "🔥 X dias", "Recorde: Y dias", freezes disponíveis.
- Grid de badges: desbloqueados (coloridos) e bloqueados (grayscale + progresso).
- Filtro por categoria (tabs).

### Entrada
- Adicionar item "Conquistas" no Menu **Mais** (`tubelight-navbar.tsx`), abaixo do Quiz.
- **Não** adicionar em Quick Actions (conforme padrão definido para Quiz).

### Toast realtime
- Hook global em `AuthProvider` (ou novo `useBadgeNotifications`) escuta INSERT em `user_badges` filtrado por `user_id` e dispara toast com ícone do badge.

### Card opcional no Dashboard
- Pequeno "🔥 X dias" ao lado do nome — discreto, não polui. (A confirmar com você.)

## Integração com Pro (assinantes)
- Streak freezes: assinantes Pro recebem 1 freeze/mês automaticamente (cron).
- Badge exclusivo "Membro Pro" desbloqueado ao virar assinante (trigger em `subscribers` quando `subscribed = true`).
- Multiplicador: novos badges contam **dobrado** para um futuro ranking de "Nível" (fora do escopo desta entrega).

## Entregáveis desta fase
1. Migração: tabelas + RLS + funções + trigger + seed de ~15 badges.
2. Página `/conquistas` com sequência + grid de badges.
3. Item no Menu Mais.
4. Hook de notificação realtime de novo badge.
5. Atualizar `mem://features/gamification/streaks-badges` e `mem://index.md`.

## Fora do escopo (fase 2)
- Pg_cron de manutenção e concessão de freezes mensais Pro.
- Card no Dashboard.
- Sistema de níveis/XP.
- Compartilhamento de conquista no WhatsApp.

Confirma se posso seguir? Se quiser, ajusto a definição de "atividade válida" (ex: exigir bater meta de calorias em vez de só registrar refeição).
