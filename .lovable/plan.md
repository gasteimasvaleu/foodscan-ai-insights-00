## Objetivo
Transformar o card de cabeçalho do `/profile` em uma experiência mais rica (estilo Instagram/Strava), com banner de capa, avatar grande sobreposto, mais dados pessoais editáveis e estatísticas em destaque.

## 1. Banco de dados (migration em `public.profiles`)
Adicionar colunas opcionais:
- `bio` text
- `phone` text
- `address` text
- `city` text
- `state` text
- `email_public` text (email de exibição editável; o email de login continua em `auth.users`)
- `cover_url` text (imagem de capa)

RLS já existente em `profiles` permanece. Sem alterações de policies.

Storage: reutilizar bucket `avatars` para covers (pasta `{userId}/cover-*.jpg`) — não precisa migration adicional.

## 2. Novo card `ProfileHeaderCard` (`src/components/profile/ProfileHeaderCard.tsx`)

Layout (mobile-first):
```
┌──────────────────────────────────┐
│  [cover image — 160px h]        │  ← editável (ícone câmera no canto)
│       ╭──────╮                   │
│       │AVATAR│ ← sobreposto -50% │
│       ╰──────╯  + badge Pro 👑   │
├──────────────────────────────────┤
│  Nome do Usuário      [Editar]  │
│  📍 Cidade, Estado               │
│  Bio em até 2 linhas...          │
│  ─────── stats chips ───────     │
│  🔥 12  │  🏅 5  │  📅 mar/26    │
│  streak   badges    membro       │
└──────────────────────────────────┘
```

Visual:
- Container: `rounded-3xl overflow-hidden bg-white/70 backdrop-blur-md border border-white/40 shadow-xl`
- Cover: gradiente fallback `from-[#FD46A1] to-[#FF8FC4]`, `aspect-[3/1]`, botão câmera no canto
- Avatar: `w-28 h-28 border-4 border-white -mt-14 ml-5`
- Badge Pro (Crown) absoluto no avatar quando `subscriptionStatus.subscribed`
- Stats: 3 chips em `bg-[#FFD1E7]/60 rounded-2xl`, ícones #FD46A1, valores `text-base`

## 3. Modal "Editar Perfil" expandido
Substituir o Dialog atual por formulário com tabs/seções (`bg-white/70 backdrop-blur-md`):
- **Identidade**: nome, bio (textarea, max 160), email público
- **Contato**: telefone, endereço, cidade, estado
- **Imagens**: upload de avatar e de capa

Validação com `zod`: nome 2-50, bio max 160, telefone regex, etc. Inputs `text-base` (anti-zoom iOS).

## 4. Stats reais
- **Streak**: ler de `user_streaks` (já existe via gamification)
- **Badges**: `count` em `user_badges` do usuário
- **Membro desde**: `profile.created_at` (mantém)

Carregar em paralelo no `useEffect`.

## 5. Arquivos
- **Novo**: migration adicionando colunas
- **Novo**: `src/components/profile/ProfileHeaderCard.tsx`
- **Novo**: `src/components/profile/EditProfileDialog.tsx`
- **Editar**: `src/pages/Profile.tsx` — substituir o Card de header atual pelo novo componente; remover o Dialog inline
- Usar `@/integrations/supabase/client` e `useAuth`

## 6. Detalhes técnicos
- Upload de cover: igual ao avatar (Supabase Storage `avatars` bucket, `upsert`)
- Subscription Pro badge: usa `subscriptionStatus.subscribed` do `useAuth`
- Sem mudanças em outros cards da página (Pro, Ações Rápidas, etc.)
- Sem mexer em `types.ts` manualmente — será regenerado após migration

## Fora de escopo
- Não alterar página de comunidade nem outros perfis públicos
- Não tocar nos outros cards do `/profile`
