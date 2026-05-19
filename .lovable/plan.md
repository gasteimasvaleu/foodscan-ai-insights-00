## Objetivo

Criar a página `/admin/to-aqui` para o admin moderar venues cadastrados (aprovar, rejeitar, reativar e ativar/desativar), e linká-la no painel admin.

## Contexto

A tabela `public.venues` já possui:
- `status` (`pending` | `approved` | `rejected`)
- `is_active` (boolean)
- RLS de admin: `venues admin select` e `venues admin update` via `has_role(auth.uid(),'admin')` — não precisa de migration.

A listagem pública em `useVenues` já filtra `status='approved' AND is_active=true`, então a moderação tem efeito imediato.

## Mudanças

### 1. Nova página `src/pages/AdminToAqui.tsx`
- Verificação de admin igual aos outros admin pages (`has_role`).
- Header padrão do app (gradient card com ícone `MapPin`, título "Tô Aqui — Moderação").
- Tabs: **Pendentes** / **Aprovados** / **Rejeitados** (filtra por `status`).
- Cada item exibe: foto (`photo_url`), nome, categoria com emoji, cidade, descrição curta, data, owner_id (com link/foto do perfil se trivial — opcional).
- Ações:
  - Pendente → botões **Aprovar** (status=approved) e **Rejeitar** (status=rejected).
  - Aprovado → botão **Desativar** (is_active=false) ou **Rejeitar**.
  - Rejeitado → botão **Aprovar** (reverter).
  - Sempre presente: link "Abrir página" para `/to-aqui/venue/:id`.
- `useQuery` por aba; `useMutation` para `update` em `venues`; invalida queries após sucesso; `toast` de feedback.

### 2. `src/App.tsx`
- Importar `AdminToAqui`.
- Adicionar `<Route path="/admin/to-aqui" element={<AdminToAqui />} />` (admin gate é interno como nos outros).

### 3. `src/pages/AdminDashboard.tsx`
- Adicionar entrada no array `adminPages`:
  ```ts
  { title: 'Tô Aqui', description: 'Aprovar e moderar venues cadastrados', icon: MapPin, path: '/admin/to-aqui' }
  ```
- Importar `MapPin` de lucide-react.

## Sem mudanças no banco
RLS e colunas já suportam tudo. Nenhuma migration necessária.
