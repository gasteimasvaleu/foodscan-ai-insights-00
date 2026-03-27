

## Criar página Receitas e adicionar ao menu "+"

### Mudanças

**1. `src/pages/Receitas.tsx`** — Nova página
- Estrutura padrão: `Navbar`, `AuthCard`, proteção por auth
- Página inicial com título "Receitas", busca de receitas salvas do Supabase (tabela `saved_recipes` se existir, ou começar com estado vazio/placeholder)
- Cards de receitas com nome, tempo de preparo, calorias
- Estilo consistente com o app (rounded-2xl, cores rosa)
- Placeholder/empty state com ícone `UtensilsCrossed` e mensagem "Nenhuma receita salva ainda"

**2. `src/App.tsx`** — Adicionar rota
- Import da página `Receitas`
- Rota: `<Route path="/receitas" element={<Receitas />} />`

**3. `src/components/ui/tubelight-navbar.tsx`** — Adicionar ao bottom sheet
- Adicionar item "Receitas" ao array `moreSheetItems` com ícone `UtensilsCrossed`, descrição "Suas receitas favoritas", url `/receitas`

