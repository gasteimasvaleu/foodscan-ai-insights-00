

## Gerenciamento de Banners da Pagina Principal

### O que sera feito

1. **Tabela `homepage_banners`** no Supabase para armazenar as imagens do banner
2. **Pagina admin `/admin/banners`** para upload/exclusao de imagens
3. **Atualizar `AuthCard.tsx`** para buscar banners do banco e exibir em carrossel com dots e autoplay de 10s
4. **Adicionar rota e link no painel admin**

### Detalhes tecnicos

**Nova tabela `homepage_banners`:**
- `id` uuid PK
- `image_url` text (URL publica do storage)
- `storage_path` text (caminho no bucket para delete)
- `display_order` integer (ordem no carrossel)
- `is_active` boolean default true
- `created_at` timestamp

RLS: SELECT publico (todos veem), INSERT/UPDATE/DELETE apenas admins via `has_role`.

**Pagina `src/pages/AdminBanners.tsx`:**
- Verificacao de admin (mesmo padrao das outras paginas admin)
- Lista de banners atuais com preview e botao de excluir
- Upload de nova imagem para bucket `criativos` 
- Drag ou campo de ordem para reordenar

**Alteracoes em `src/components/AuthCard.tsx` (linhas 71-80):**
- Buscar banners da tabela `homepage_banners` ordenados por `display_order`
- Se 1 banner: imagem estatica (comportamento atual)
- Se 2+: carrossel com autoplay 10s e dots indicadores
- Fallback para imagem hardcoded atual se nenhum banner cadastrado

**Alteracoes em `src/pages/AdminDashboard.tsx`:**
- Adicionar card "Banners" com icone `ImageIcon` apontando para `/admin/banners`

**Alteracoes em `src/App.tsx`:**
- Adicionar rota `/admin/banners` → `AdminBanners`

### Arquivos alterados/criados
- `supabase/migrations/` — nova tabela + RLS
- `src/pages/AdminBanners.tsx` — nova pagina
- `src/pages/AdminDashboard.tsx` — novo card
- `src/App.tsx` — nova rota
- `src/components/AuthCard.tsx` — carrossel dinamico

