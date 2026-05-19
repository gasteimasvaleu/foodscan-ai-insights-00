## Objetivo

Esconder o TubelightNavbar (menu inferior) na sala individual de chat do venue (`/to-aqui/venue/:id/chat`), seguindo o padrão já usado em `/comunidade/chat` e `/comunidade/dm/:id`.

## Mudança

Em `src/App.tsx`, dentro de `AuthAwareNavbar`, adicionar a rota ao guard que já esconde a navbar:

```tsx
if (
  location.pathname === '/auth' ||
  location.pathname === '/comunidade/chat' ||
  location.pathname.startsWith('/comunidade/dm/') ||
  /^\/to-aqui\/venue\/[^/]+\/chat$/.test(location.pathname)
) return null;
```

## Sem outras mudanças
- Nenhuma alteração em `ToAquiChat.tsx`, hooks ou banco.
