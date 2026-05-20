## Mostrar Tubelight Navbar no Mercado Fácil

Hoje a navbar inferior está explicitamente escondida em todas as rotas `/mercado-facil/*` por uma condição em `src/App.tsx`.

### Mudança

Remover apenas o trecho `|| location.pathname.startsWith('/mercado-facil')` da condição em `AuthAwareNavbar` (linha 119 de `src/App.tsx`).

As demais regras de ocultação continuam:
- `/auth`
- `/comunidade/chat`
- `/comunidade/dm/:id`
- `/to-aqui/venue/:id/chat`

### Por que é seguro

Todas as 12 páginas do Mercado Fácil já usam `pb-28` no `<main>`, então o conteúdo não fica coberto pela Tubelight Navbar.

### Não incluído

- Não vou criar item dedicado "Mercado Fácil" na navbar (continua acessível pelo Menu +).
- Não vou tocar em outros lugares onde a navbar é escondida (paywall, VIP, etc.).