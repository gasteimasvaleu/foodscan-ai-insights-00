

## Animação de entrada nos cards do QuickActions

Adicionar animação staggered (escalonada) nos cards, onde cada card entra de baixo para cima com um leve delay entre eles, criando um efeito cascata.

### Alterações

**`src/components/QuickActions.tsx`**
- Adicionar estado `visible` que ativa após montagem do componente
- Cada card recebe `opacity: 0` → `opacity: 1` e `translateY(30px)` → `translateY(0)` via CSS transition
- Delay escalonado: card 0 = 0ms, card 1 = 80ms, card 2 = 160ms, etc.
- Transição suave de 400ms com `ease-out`
- Usar `useEffect` com pequeno timeout para triggerar a animação após render

Nenhum arquivo adicional precisa ser alterado — as animações serão inline via style + transition CSS.

