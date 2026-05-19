## Adicionar botão de excluir venue em /admin/to-aqui

Adicionar um botão "Excluir" em cada card de venue na página `src/pages/AdminToAqui.tsx`, permitindo que o admin remova permanentemente o bar/festa/restaurante.

### Mudanças em `src/pages/AdminToAqui.tsx`

1. Importar `Trash2` de `lucide-react` e os componentes `AlertDialog*` de `@/components/ui/alert-dialog`.
2. Criar uma mutation `deleteMutation`:
   - `supabase.from("venues").delete().eq("id", id)`
   - Em `onSuccess`: invalidar `["admin-venues"]` e `["venues"]`, mostrar toast "Venue excluído".
3. Adicionar um botão vermelho "Excluir" no final da linha de ações (em todas as tabs: pendentes, aprovados e rejeitados), envolvido em um `AlertDialog` de confirmação com o texto: "Tem certeza? Esta ação remove o venue e todos os dados relacionados (chats, presenças, etc) permanentemente."
4. O `ON DELETE CASCADE` já existente nas tabelas `venue_*` cuida das dependências.

### Fora de escopo

- Sem mudanças de schema/RLS (a policy `venues admin manage` já permite delete para admins).
- Sem mudanças em outras páginas.
