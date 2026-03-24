

## Adicionar padding inferior global para evitar conteúdo atrás do menu

A abordagem mais simples e consistente: adicionar `padding-bottom` global no `index.css` ao `body`, evitando editar cada página individualmente.

### Alteração em `src/index.css`

No bloco `@layer base` do `body`, adicionar `padding-bottom: 100px` para garantir que nenhum conteúdo fique escondido atrás do menu Tubelight (~80px de altura + margem).

```css
body {
  /* regras existentes... */
  padding-bottom: 100px;
}
```

Isso aplica automaticamente a todas as páginas sem precisar editar cada uma.

