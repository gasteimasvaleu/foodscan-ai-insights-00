# Reduzir padding superior da página /maternidade

## Causa

`src/pages/Maternidade.tsx` aplica `pt-[calc(env(safe-area-inset-top)+4rem)]` no wrapper (padrão do projeto) **e** adiciona `py-4` no `<main>`, somando mais 1rem de padding-top que outras páginas internas não têm.

```tsx
<div className="... pt-[calc(env(safe-area-inset-top)+4rem)] pb-28">
  <Navbar />
  <main className="px-4 py-4 max-w-3xl mx-auto space-y-4">
```

## Mudança

Trocar `py-4` por `pb-4` no `<main>` para alinhar o espaçamento superior com as demais páginas (ex.: Receitas, Objetivos, ShoppingList).

Arquivo: `src/pages/Maternidade.tsx` (linha 34).

Sem alterações de lógica.
