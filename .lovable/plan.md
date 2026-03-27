

## Corrigir erro na página Receitas

### Diagnóstico

1. **Erro de validação (esperado)**: O replay mostra que o usuário clicou "Buscar" sem digitar nada no campo de busca, resultando no toast "Digite algo para buscar". Isso é o comportamento correto de validação.

2. **Erro de acessibilidade no DialogContent**: O console mostra que `RecipeDetails` não renderiza um `DialogTitle` durante o estado de loading, causando o erro do Radix UI.

3. **Edge function pode não estar deployada**: Não há logs da função `spoonacular-recipes`, o que pode indicar que ela ainda não foi deployada.

### Mudanças

**1. Deploy da edge function `spoonacular-recipes`**
- Garantir que a função está deployada no Supabase.

**2. Corrigir acessibilidade em `src/components/RecipeDetails.tsx`**
- Adicionar `DialogTitle` com `VisuallyHidden` no estado de loading para evitar o erro de acessibilidade.
- Importar `DialogDescription` ou adicionar `aria-describedby={undefined}` no `DialogContent`.

**3. Melhorar UX de validação em `src/pages/Receitas.tsx`** (opcional)
- Ao invés de permitir clicar "Buscar" com campo vazio, desabilitar o botão quando `query` está vazio.

### Detalhes técnicos

No `RecipeDetails.tsx`, envolver o conteúdo de loading com um `DialogHeader` contendo um `DialogTitle` oculto:

```tsx
<DialogContent className="..." aria-describedby={undefined}>
  <DialogHeader>
    <DialogTitle className="sr-only">Detalhes da Receita</DialogTitle>
  </DialogHeader>
  {loading ? (...) : recipe ? (...) : null}
</DialogContent>
```

