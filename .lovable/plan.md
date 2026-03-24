

## Esconder barra de scroll vertical

### Alteração em `src/index.css`

Adicionar regras CSS globais para esconder a scrollbar vertical em todos os navegadores, mantendo o scroll funcional:

```css
/* Hide scrollbar for native app feel */
::-webkit-scrollbar {
  display: none;
}

body {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

Inserir dentro do bloco `@layer base`, junto às regras existentes do `body`.

