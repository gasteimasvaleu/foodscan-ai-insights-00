## Objetivo
Criar uma rota no painel `/admin` para aprovar, recusar e suspender entregadores cadastrados no Mercado Fácil.

## Passos

1. **Nova página `src/pages/admin/AdminEntregadores.tsx`**
   - Lista todos os registros de `mf_entregadores` ordenados por `created_at desc`.
   - Filtros por status: Pendentes / Aprovados / Recusados / Suspensos.
   - Cada card mostra: nome, telefone, cidade/estado, veículo, documento, link para CNH e foto (signed URL do bucket `mercado-facil-entregadores`), avaliação média, total de entregas.
   - Ações: **Aprovar**, **Recusar**, **Suspender**, **Reativar** (atualiza `status` em `mf_entregadores`).
   - Visual segue padrão de `AdminMercadoFacil.tsx` (MFHeader, cards brancos `rounded-3xl`, botões `#FD46A1`).

2. **Registrar rota em `src/App.tsx`**
   - `/admin/entregadores` → `AdminEntregadores`.

3. **Adicionar card no `src/pages/AdminDashboard.tsx`**
   - Novo item no array `adminPages`: título "Entregadores Mercado Fácil", ícone `Truck` (lucide-react), path `/admin/entregadores`, descrição "Aprovar e moderar cadastros de entregadores".
   - Também adicionar card "Mercado Fácil" apontando para `/admin/mercado-facil` (atualmente não está listado no dashboard).

## Detalhes técnicos
- Acesso protegido por `has_role(_user_id, 'admin')` — mesmo padrão de `AdminDashboard`.
- A política RLS já existente em `mf_entregadores` permite admin ler/atualizar todos os registros (criada na migração anterior), então não é necessária nova migração.
- Updates feitos via `supabase.from('mf_entregadores').update({ status }).eq('id', ...)`.
- CNH/foto exibidas via `supabase.storage.from('mercado-facil-entregadores').createSignedUrl(path, 3600)`.
