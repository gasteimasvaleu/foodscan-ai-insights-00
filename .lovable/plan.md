

## Problema

O `env(safe-area-inset-top)` não funciona porque o `<meta name="viewport">` no `index.html` não tem `viewport-fit=cover`. Sem isso, o iOS ignora as variáveis de safe area e retorna 0.

## Solução

### 1. Arquivo: `index.html` (linha 24)

Adicionar `viewport-fit=cover` ao meta viewport:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

Isso ativa as variáveis `env(safe-area-inset-*)` no iOS/Capacitor. A navbar já tem `paddingTop: env(safe-area-inset-top)` e o conteúdo das páginas já usa `calc(env(safe-area-inset-top) + 4rem)`, então tudo deve funcionar automaticamente após essa única mudança.

### Após a mudança

1. `npm run build`
2. `npx cap sync ios`
3. Rodar no Xcode

