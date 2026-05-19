## Plano

Mostrar a navbar TubelightNavbar na página `/to-aqui/venue/:id/atividade` (atualmente está escondida).

### Mudanças

1. **`src/App.tsx`** — ajustar o regex do guard que esconde a Navbar para esconder apenas em `/chat`, deixando `/atividade` aparecer:
   - De: `/^\/to-aqui\/venue\/[^/]+\/(chat|atividade)$/`
   - Para: `/^\/to-aqui\/venue\/[^/]+\/chat$/`

2. **`src/pages/ToAquiActivity.tsx`** — tirar o layout `fixed inset-0` para o conteúdo conviver com a navbar:
   - Trocar o container raiz por `min-h-screen bg-[#F7FAFB] flex flex-col`.
   - Adicionar `pb-28` na lista para não ficar atrás da navbar.
   - Header pode continuar sticky no topo.