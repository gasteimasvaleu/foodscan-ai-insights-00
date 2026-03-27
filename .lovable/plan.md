

## Integrar Spoonacular na página Receitas

### Contexto
A página Receitas está vazia. Vamos integrá-la com a API do Spoonacular para buscar receitas com dados nutricionais. A API key do Spoonacular ainda não existe nos secrets — precisamos adicioná-la.

### Arquitetura

```text
Frontend (Receitas.tsx)
  → supabase.functions.invoke("spoonacular-recipes")
    → Edge Function proxy → api.spoonacular.com
```

### Etapas

**1. Adicionar secret `SPOONACULAR_API_KEY`**
- Solicitar ao usuário a chave da API (obtida em spoonacular.com/food-api/console)

**2. Criar Edge Function `supabase/functions/spoonacular-recipes/index.ts`**
- Endpoints: busca por texto (`/recipes/complexSearch`), receita por ID (`/recipes/{id}/information`)
- Inclui dados nutricionais (`addNutritionInformation=true`)
- CORS headers, validação de input com Zod
- Parâmetros: `query` (busca), `id` (detalhes), `cuisine` (filtro), `diet` (filtro), `number` (quantidade)

**3. Criar componente `src/components/RecipeCard.tsx`**
- Card com imagem, título, tempo de preparo, porções
- Macros resumidos (calorias, proteínas, carboidratos, gorduras)
- Botão para ver detalhes

**4. Criar componente `src/components/RecipeDetails.tsx`**
- Modal/dialog com receita completa: ingredientes, instruções passo-a-passo
- Tabela nutricional detalhada
- Imagem grande

**5. Atualizar `src/pages/Receitas.tsx`**
- Campo de busca com ícone Search
- Filtros: tipo de dieta (vegetariana, low-carb, etc.), tipo de culinária
- Grid de RecipeCards com resultados
- Loading skeleton durante busca
- Estado vazio quando sem resultados
- Paginação simples (carregar mais)
- Ao clicar num card, abre RecipeDetails

### Detalhes técnicos
- A API gratuita do Spoonacular permite 150 requests/dia
- Tradução dos nomes dos nutrientes para PT-BR no frontend
- Não é necessário criar tabela no banco (receitas vêm direto da API, sem persistência por enquanto)

