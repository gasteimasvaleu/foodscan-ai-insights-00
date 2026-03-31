

## Esconder Navbar e TubelightNavbar na página /auth

### Problema
Após o cadastro VIP na `/auth`, o usuário é auto-logado (`signInWithPassword`). Isso faz `user` ficar truthy, e tanto a `Navbar` quanto a `TubelightNavbar` aparecem — mas essa página deveria ser limpa, sem navegação.

### Alterações

**1. `src/App.tsx` — AuthAwareNavbar**
Adicionar `useLocation()` e retornar `null` quando `pathname === '/auth'`.

**2. `src/pages/Auth.tsx`**
Remover o `<Navbar />` do render (linha 74). A página /auth não deve exibir navbar em nenhum cenário.

