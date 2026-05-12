## Chat Global em Tempo Real — Comunidade We Diet

Sala única onde todos os usuários logados conversam em tempo real, com presence (online + digitando) e moderação automática + denúncia.

### 1. Banco de dados (Supabase)

**Tabela `chat_messages`**
- `id` uuid PK
- `user_id` uuid → `public.profiles(id)` ON DELETE CASCADE
- `content` text (1–500 chars, validado)
- `created_at` timestamptz
- `is_deleted` boolean (soft delete via moderação)
- `deleted_reason` text nullable

RLS:
- SELECT: qualquer autenticado vê mensagens com `is_deleted = false`
- INSERT: `auth.uid() = user_id` + rate limit por trigger (máx 10 msgs/min)
- UPDATE/DELETE: só o autor (ou admin via `has_role`)

**Tabela `chat_reports`**
- `id`, `message_id`, `reporter_id`, `reason`, `status` ('pending'|'reviewed'|'dismissed'), `created_at`
- RLS: usuário cria suas denúncias; admin vê todas

**Tabela `chat_banned_words`** (gerenciada pelo admin)
- `id`, `word` text unique, `severity` ('block'|'warn')
- Lista inicial de palavrões PT-BR

**Trigger `chat_messages_filter`** (BEFORE INSERT)
- Verifica `content` contra `chat_banned_words` (severity='block') → rejeita com erro
- Rate limit: rejeita se autor já enviou 10 msgs nos últimos 60s

**Realtime habilitado** em `chat_messages` (publication `supabase_realtime`).

### 2. Frontend

**Nova rota:** `/comunidade/chat` (botão "Chat ao vivo" dentro da página `/comunidade` existente)

**Componente `ChatGlobal.tsx`**
- Layout full-screen tipo WhatsApp: header (título + contador "X online") / lista de mensagens (scroll reverso) / input fixo no rodapé
- Bolhas: minhas à direita (#FD46A1), outras à esquerda (#FFD1E7), avatar + nome do `profiles`
- Input com emoji picker leve (`emoji-picker-react` ou nativo) e botão enviar
- Long-press / menu (⋮) na mensagem alheia → "Denunciar"
- Carrega últimas 50 mensagens, paginação ao rolar pra cima
- Subscribe a `postgres_changes` INSERT em `chat_messages`
- Cliente trunca em 500 chars + valida com Zod antes de enviar

**Presence (Supabase Realtime Channels)**
- Canal `chat-global-presence` com `track({ user_id, name, typing: false })`
- Indicador "fulano está digitando..." (debounce 1.5s)
- Header mostra "X usuários online"

**Layout**
- Respeita `pt-[calc(env(safe-area-inset-top)+4rem)]`
- Input com `pb-[env(safe-area-inset-bottom)]`, sobe com teclado iOS
- Card pattern: bolhas `rounded-2xl`, sem ícones decorativos no header

### 3. Moderação

- Filtro automático no banco (trigger) → bloqueia palavrões antes de inserir, retorna toast amigável
- Botão "Denunciar" → cria `chat_reports`
- Painel admin em `/admin/chat`: lista denúncias pendentes, botões "Apagar mensagem" (set `is_deleted=true`) e "Dispensar"
- CRUD simples para `chat_banned_words` no mesmo painel

### 4. Notificações (futuro, fora do MVP)
- Não envia push por mensagem (seria spam). Apenas badge "novas mensagens" se a tela estiver aberta em outro contexto.

### 5. Pontos de atenção
- **Custo Realtime**: chat global pode crescer rápido. Limitar a últimas 50 msgs no client e arquivar mensagens >30 dias via pg_cron.
- **Spam/flood**: rate limit no trigger é a primeira linha de defesa.
- **LGPD**: usuário pode deletar suas próprias mensagens via menu.
- **Mobile keyboard**: testar bem em iOS nativo (Capacitor) — input precisa ficar acima do teclado.

### Entregáveis
1. Migration: 3 tabelas + RLS + trigger de filtro/rate limit + seed de palavrões
2. `src/pages/ChatGlobal.tsx` + rota
3. `src/pages/admin/AdminChat.tsx` + link no `/admin`
4. Botão de acesso na página `/comunidade`
