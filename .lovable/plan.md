

## Conectar cards de ação rápida com a faixa branca do menu

### Problema
No dispositivo real, o último card (WhatsApp) não alcança a faixa branca do menu inferior, criando um gap visual.

### Alterações

**1. `src/components/QuickActions.tsx`** - Aumentar altura do último card:
- Alterar `minHeight` do último card de `120px` para `160px`
- Aumentar `paddingBottom` do último card de `32px` para `64px`
- Manter todos os outros cards iguais

**2. `src/components/ui/tubelight-navbar.tsx`** - Adicionar padding inferior ao menu:
- Alterar `pb-[env(safe-area-inset-bottom)]` para incluir um padding base adicional, algo como `pb-[calc(8px+env(safe-area-inset-bottom))]`
- Isso faz a faixa branca decorativa aparecer também na parte inferior do menu

