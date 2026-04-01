

## Adicionar Navbar na página de Jejum Intermitente

### Problema
A página `/jejum` não inclui o componente `<Navbar />` (menu superior com perfil/logout), que está presente em todas as outras páginas do app. Também falta o `<AuthCard />` para exibir login quando o usuário não está autenticado.

### Alteração
**Editar**: `src/pages/IntermittentFasting.tsx`
- Importar `Navbar` de `@/components/Navbar` e `AuthCard` de `@/components/AuthCard`
- Adicionar `<Navbar />` no topo do JSX (antes do header gradiente)
- Adicionar checagem de `!user` retornando `<AuthCard />` (mesmo padrão de Hydration, Receitas, etc.)

