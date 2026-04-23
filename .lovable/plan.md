

## Mostrar últimas 5 análises abaixo do card de upload em "Faça em Casa"

Adicionar uma seção logo abaixo do `DishImageUpload` listando as **últimas 5 receitas salvas** pelo usuário, como atalho visual ao histórico.

### Comportamento
- Aparece **apenas no estado inicial** (mesma condição `showUpload`: sem análise em andamento, sem opções de fast-food, sem receita exibida).
- Se o usuário não tiver nenhuma receita salva, a seção **não é renderizada** (sem placeholder).
- Clicar em um item abre o **mesmo Drawer de histórico** já existente, na receita selecionada (ou simplesmente abre o drawer de histórico). Para manter o escopo enxuto: clicar em um item **abre o drawer de histórico já existente**.

### Onde renderizar
Em `src/pages/FacaEmCasa.tsx`, dentro do bloco `{showUpload && (...)}`, logo após `<DishImageUpload />`.

### Fonte de dados
Tabela `recipes` (já usada no histórico):
```ts
supabase
  .from('recipes')
  .select('id, nome, recipe_data, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .limit(5)
```
Carregar via `useEffect` no mount da página (e re-fetch após salvar uma nova receita).

### UI da seção
- Título pequeno: **"Últimas análises"** (text-sm, font-semibold, text-foreground/80, mt-5 mb-2, px-1).
- Lista vertical de até 5 itens (mesmo padrão visual do drawer de histórico para consistência):
  - Container do item: `flex items-center gap-3 p-3 rounded-2xl bg-[#FFD1E7]/40 border border-primary/10`.
  - Thumbnail circular 40x40 com ícone `ChefHat` (em gradiente primary→accent), já que `recipe_data` não tem imagem persistida.
  - Texto: `nome` em `font-bold truncate` + data formatada `pt-BR` em `text-xs text-muted-foreground`.
  - Toda a linha é clicável (`button`) e abre `setHistoryOpen(true)`.

### Atualização após salvar
Após `handleSave()` bem-sucedido, chamar a função de fetch novamente para refletir a nova receita no topo da lista.

### Arquivo afetado
- `src/pages/FacaEmCasa.tsx` — adicionar estado `recentRecipes`, função `fetchRecent`, `useEffect` no mount, re-fetch no save, e bloco JSX da seção dentro de `showUpload`.

### Fora do escopo
- Mudanças no `DishImageUpload`, no hook `useDishRecipe`, no drawer de histórico ou no banco.
- Thumbnails reais de prato (hoje `recipes.image_url` é sempre `null` no fluxo atual).

