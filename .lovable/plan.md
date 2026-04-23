

## Abrir receita salva ao clicar no item das "Últimas análises"

Hoje clicar em um item de "Últimas análises" apenas abre o drawer de histórico. Vou fazer com que clicar exiba **a receita completa** (mesmo `HomeRecipeCard` usado após uma análise nova), com botões de Nova / Compartilhar / Excluir.

### Comportamento
- Clicar em um item de "Últimas análises" **ou** em um item dentro do Drawer de Histórico:
  - Carrega `recipe_data` da linha selecionada num novo estado local `viewingRecipe`.
  - Fecha o Drawer de Histórico (se estiver aberto).
  - Renderiza o `HomeRecipeCard` com a receita.
- Os estados existentes do hook `useDishRecipe` (`step`, `isLoading`, `recipe`, `options`) **não são tocados** — assim não conflita com uma análise em andamento.
- Botão **Nova** volta para o estado inicial (limpa `viewingRecipe`).
- Botão **Compartilhar** reutiliza o `handleShare` atual, mas passando a receita ativa (a do hook OU `viewingRecipe`).
- Botão **Salvar** é substituído por **Excluir** quando estamos visualizando uma receita já salva (pois ela já está no banco). Excluir chama o `handleDelete` existente com o `id` da receita salva e volta ao estado inicial.

### Estados de renderização (atualizados)
- `showUpload` = sem loading, sem `recipe` do hook, sem `options`, **e sem `viewingRecipe`**.
- `showRecipe` = `recipe` do hook **ou** `viewingRecipe`.
- `showProgress` e `showOptions` permanecem iguais.

A variável `activeRecipe = recipe ?? viewingRecipe` é usada no `HomeRecipeCard` e no `handleShare`.

### Botões abaixo da receita
- Quando exibindo `viewingRecipe` (já salva): **Nova** | **Compartilhar** | **Excluir** (vermelho/destructive).
- Quando exibindo `recipe` recém-analisada (fluxo atual): **Nova** | **Compartilhar** | **Salvar** (sem mudança).

### Arquivo afetado
- `src/pages/FacaEmCasa.tsx`
  - Novo estado `viewingRecipe: { id: string; data: Recipe } | null`.
  - Handler `openSavedRecipe(saved: SavedRecipe)` usado tanto em "Últimas análises" quanto nos itens do Drawer de Histórico (atualmente o item do drawer só tem botão de excluir — adiciono área clicável no nome/data para abrir).
  - Ajuste de `showUpload` / `showRecipe` e do bloco de botões.
  - `handleShare` passa a usar `activeRecipe`.
  - `reset()` do hook + `setViewingRecipe(null)` no botão Nova.

### Fora do escopo
- Edição da receita salva.
- Mudanças no `HomeRecipeCard`, no hook `useDishRecipe` ou no banco.

