## Fix: Navbar tubelight cobrindo input do chat

**Causa:** O `TubelightNavbar` é renderizado globalmente em `App.tsx` com `fixed bottom-2 z-40`. O `ChatGlobal` é fullscreen com input no rodapé, então o navbar fica por cima.

**Solução:** Esconder o navbar tubelight na rota `/comunidade/chat` (mesmo padrão já usado em `/auth`, Paywall e VIP — chat fullscreen tipo WhatsApp não combina com bottom nav).

### Mudança

`src/App.tsx` — adicionar a rota à lista de exceções do `NavbarWrapper`:
```ts
if (location.pathname === '/auth' || location.pathname === '/comunidade/chat') return null;
```

Botão "voltar" no header do chat já existe, então a navegação não fica presa.
