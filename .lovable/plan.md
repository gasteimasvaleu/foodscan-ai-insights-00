

## Conectar último card do QuickActions à faixa branca do menu

O último card (WhatsApp) precisa ficar parcialmente atrás da faixa branca do Tubelight, eliminando o espaço entre eles.

### Alteração em `src/components/QuickActions.tsx`

- Aumentar o `marginBottom` negativo do container de `-24px` para `-48px`, fazendo o bloco inteiro descer mais e o último card ficar parcialmente coberto pela faixa branca do menu

### Alteração em `src/pages/Index.tsx`

- Reduzir o `pb-28` para `pb-20` na Index, já que o QuickActions agora se estende mais para baixo com o margin negativo

