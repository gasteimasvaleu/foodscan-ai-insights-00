

## Problema

No `src/index.css` (linha 158-164), existe esta regra:

```css
@media all and (display-mode: standalone) {
  body {
    background-color: #FD46A1;
  }
}
```

O Capacitor roda em modo standalone, então o body fica rosa. O fundo deveria ser o cinza claro `#F7FAFB` como no navegador.

## Solução

**Arquivo: `src/index.css`**

Alterar a cor do `background-color` no bloco `display-mode: standalone` de `#FD46A1` para `#F7FAFB`:

```css
@media all and (display-mode: standalone) {
  body {
    margin: 0;
    padding: 0;
    background-color: #F7FAFB;
  }
}
```

Isso garante que tanto no navegador quanto no app nativo/PWA o fundo será o cinza claro correto.

## Após a mudança

1. `git pull`
2. `npm run build`
3. `npx cap sync ios`
4. Rodar no Xcode

