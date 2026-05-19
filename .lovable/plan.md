
## Visão geral

O repo `toaquiapp` é um app Lovable (React + Vite + Supabase) — mesma stack do We Diet. Dá pra trazer todas as features adaptando o schema ao que já existe aqui, sem quebrar nada do app atual.

**Mapeamento conceitual:**

| Tô Aqui                          | We Diet (destino)                                |
|----------------------------------|--------------------------------------------------|
| `profiles` (apelido, role)       | `profiles` existente + colunas novas             |
| `venues`                         | `venues` (nova tabela)                           |
| `venue_memberships` (entrou)     | `venue_memberships` (nova)                       |
| `messages` (chat do bar)         | `venue_messages` (nova, evita colidir com `chat_messages` global) |
| `presence`                       | `venue_presence` (nova)                          |
| `interactions` (poke/drink/found_you) | `venue_interactions` (nova)                 |
| `matches` + `private_messages`   | reaproveita `dm_conversations` + `dm_messages` já existentes |
| `bans` / `reports`               | `venue_bans` / `venue_reports`                   |
| Edge `flirt-coach`               | nova edge `venue-flirt-coach` via Lovable AI Gateway |

## Estrutura nova no We Diet

### Rotas (em `App.tsx`)
- `/to-aqui` — landing do módulo: busca + lista de venues (estilo `/loja`)
- `/to-aqui/venue/:id` — detalhe + entrar no chat
- `/to-aqui/venue/:id/chat` — chat fullscreen do venue (esconde TubelightNavbar, mesmo padrão de `/comunidade/chat`)
- `/to-aqui/owner` — onboarding "sou dono de venue" + meus venues
- `/to-aqui/owner/venue/new` e `/to-aqui/owner/venue/:id/edit` — CRUD do dono
- `/admin/venues` — moderação (reports, bans, claims pendentes)

DMs pós-match reusam `/comunidade/dm/:id` que já existe.

### Entrada no Menu +
Adicionar item "Tô Aqui" na grade do menu `+` (junto com Loja, Lista, Quiz, etc.) apontando pra `/to-aqui`. Sem "Ativar/Desativar" — abre direto a aba; o usuário comum só consome, owners têm o /to-aqui/owner.

### Identidade no chat (escolha por sessão)
Ao entrar num venue, modal pergunta:
- **Modo real**: usa `name` + `avatar_url` do profile We Diet
- **Modo anônimo**: usa apelido livre (string só na sessão) + avatar genérico
Salvo em `venue_memberships.display_mode` ('real' | 'anonymous') + `display_alias`.

### Cadastro de venues por dono (com claim)
Qualquer usuário logado pode criar um venue em `/to-aqui/owner/venue/new`, mas ele entra com `status = 'pending'` e só vira `'approved'` (visível na busca) após:
- admin aprovar manualmente em `/admin/venues`, **ou**
- claim verificado via código enviado por e-mail do venue (futuro; deixar gancho)

Dono ganha role implícita pelo FK `venues.owner_id = profiles.id` (não precisa coluna `role` global). O painel `/to-aqui/owner` lista os venues que ele criou.

### Descoberta = busca + lista
Página `/to-aqui` com:
- input de busca (nome / cidade / categoria)
- chips de categoria (Bar, Restaurante, Festa, Balada)
- lista paginada de venues ativos com foto, online_count em tempo real

Sem geolocalização (decisão do usuário).

## Schema novo (migration única)

```sql
-- 1. Venues
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null check (category in ('bar','restaurante','festa','balada')),
  city text not null,
  address text,
  photo_url text,
  description text,
  rules text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Memberships (com modo de identidade)
create table public.venue_memberships (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_mode text not null default 'real' check (display_mode in ('real','anonymous')),
  display_alias text,
  joined_at timestamptz not null default now(),
  unique(venue_id, user_id)
);

-- 3. Mensagens do venue (não usa chat_messages global)
create table public.venue_messages (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  is_mystery_tip boolean not null default false,
  mystery_hint text,
  created_at timestamptz not null default now()
);

-- 4. Presença (online nos últimos 5min)
create table public.venue_presence (
  venue_id uuid not null references public.venues(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  last_seen timestamptz not null default now(),
  primary key (venue_id, user_id)
);

-- 5. Interações (poke, drink, found_you)
create table public.venue_interactions (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.venues(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('poke','drink','found_you')),
  emoji text,
  status text not null default 'pending' check (status in ('pending','accepted','declined','seen')),
  created_at timestamptz not null default now()
);

-- 6. Bans + Reports
create table public.venue_bans (...);    -- igual ao Tô Aqui
create table public.venue_reports (...); -- igual ao Tô Aqui
```

Funções/triggers (portados do Tô Aqui):
- `can_access_venue(venue_id, user_id)` — owner OU member AND NOT banned
- Trigger em `venue_interactions`: rate limit (20/h, cooldown 30s) + match recíproco → cria conversa em `dm_conversations` (reusa `get_or_create_dm_conversation`)
- Trigger em `venue_messages`: filtro de palavrões (reusa `chat_banned_words`) + telefone/link/email blockados
- Realtime ligado em `venue_messages`, `venue_presence`, `venue_interactions`

RLS: padrão `auth.uid()` participante; venues SELECT público quando `status='approved' AND is_active=true`; admin via `has_role(auth.uid(),'admin')`.

## Implementação por fases

1. **Migration** com todas as tabelas, funções, triggers, RLS, realtime.
2. **Hooks** `useVenues`, `useVenueChat`, `useVenuePresence`, `useVenueInteractions`, `useVenueMatch` (adaptados de `src/hooks/useChat.ts`, `useVenues.ts`, `useInteractions.ts`, `useMatches.ts` do Tô Aqui).
3. **Páginas** `/to-aqui` (Search), `/to-aqui/venue/:id` (Detail), `/to-aqui/venue/:id/chat` (ChatRoom), `/to-aqui/owner/*` (CreateVenue + VenueSettings).
4. **Componentes** `VenueCard`, `VenueFilters`, `ChatRoom`, `MessageBubble`, `OnlineUsers`, `InteractionMenu`, `IdentityChoiceModal` — portados e re-estilizados com paleta We Diet (#FD46A1, #FFD1E7, glassmorphism nos modais).
5. **Entrada no Menu +** — adicionar card "Tô Aqui" e roteamento.
6. **Match → DM existente** — quando o trigger cria match, abre `/comunidade/dm/:conversationId`. Toast realtime "Match no [venue]! Toca pra conversar".
7. **Edge function** `venue-flirt-coach` (Lovable AI Gateway) opcional — sugere mensagens criativas baseadas no contexto do chat.
8. **Admin** `/admin/venues` — aprovar/rejeitar venues pendentes, ver reports, banir.

## Pontos importantes

- **Sem novas dependências** — o repo Tô Aqui usa o mesmo stack (React Query, Supabase JS, shadcn, Tailwind) que já está aqui.
- **Não toca em features atuais** — tabelas com prefixo `venue_*` evitam colisão com `chat_messages`, `community_posts`, `dm_messages`.
- **Identidade**: a coluna `role` global do Tô Aqui não vem — ownership é por `venues.owner_id`. Admin continua via `user_roles` existente.
- **Reuso de DM**: economia grande — não duplica `private_messages`, encaixa nas DMs do `/comunidade/dm/:id`.
- **iOS**: rota `/to-aqui/venue/:id/chat` precisa esconder a Navbar (igual `/comunidade/chat`) e usar `pt-[calc(env(safe-area-inset-top)+4rem)]`.
- **Free vs Pro**: deixar `/to-aqui` aberto pra todos (engaja muito) ou gatear em `ProRoute`? **Sugestão:** browsing + entrar em chat = free; mandar interações (poke/drink) e DM = Pro. Confirma essa decisão antes da implementação.

## Próximo passo

Se topar o plano, eu sigo na ordem: migration → hooks → páginas → menu → admin. Posso entregar tudo num PR só ou ir em fatias (recomendo fatias: 1) migration + listagem/busca; 2) chat de venue + presença; 3) interações + match→DM; 4) admin + claim).
