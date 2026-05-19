## Objetivo

Reaproveitar o layout de header (banner gradiente + avatar circular sobreposto) na página do owner para **alterar a foto do venue** via upload, tanto no cadastro novo quanto na edição.

## Decisão de UX

O usuário pediu para alterar a imagem na "página de admin do venue". Hoje só existe `/to-aqui/owner/venue/new` (cadastro). Vamos:

1. Substituir o picker de foto atual em `ToAquiNewVenue.tsx` por um **header preview** no mesmo padrão de `ToAquiVenue.tsx`:
   - Banner h-32 com gradiente `from-[#FD46A1] to-[#FFD1E7]` (mostra `photo_url` se houver)
   - Avatar circular 112×112 com borda branca, sobreposto (-mt-16)
   - **Botão circular #FD46A1 com ícone Camera** sobre o avatar (canto inferior direito), aciona `<input type="file">`
   - Se já há foto: pequeno botão X sobre o banner para remover

2. Criar página de edição `/to-aqui/owner/venue/:id/edit` (gated por `ProRoute`) reutilizando o mesmo formulário/header, com:
   - Carrega dados via `useVenue(id)` (só permite editar se `owner_id === user.id`)
   - Update via `supabase.from("venues").update(...).eq("id", id)`
   - Bloqueia edição se outro usuário

3. Tornar cada card em `ToAquiOwner` clicável (`<Link to={/to-aqui/owner/venue/${v.id}/edit}>`).

## Arquivos

### Novo: `src/components/to-aqui/VenuePhotoHeader.tsx`
Componente reutilizável com:
- Props: `photoUrl`, `categoryEmoji`, `name`, `uploading`, `onPickFile(file)`, `onRemove()`
- Renderiza banner + avatar + botão Camera (input file oculto) + botão X opcional.

### Editado: `src/pages/ToAquiNewVenue.tsx`
- Remove o card de upload atual (`ImagePlus` button + preview)
- Insere `<VenuePhotoHeader ... />` no topo do formulário
- Mantém handlers `onPickPhoto` / `onRemovePhoto` (passados ao componente)

### Novo: `src/pages/ToAquiEditVenue.tsx`
- Carrega venue, popula form igual ao de cadastro, salva via `update`
- Mesmo header reutilizado

### Editado: `src/App.tsx`
- Adicionar rota `/to-aqui/owner/venue/:id/edit` (lazy import) protegida por `ProRoute`

### Editado: `src/pages/ToAquiOwner.tsx`
- Envolver cada `<li>` em `<Link to={/to-aqui/owner/venue/${v.id}/edit}>`

## Sem mudanças
- Bucket `venue-photos` já existe, RLS de `venues` já permite owner update (presumido — se não, criar policy).
- Nenhuma migração de schema necessária.
