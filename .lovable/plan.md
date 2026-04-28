## Visão geral

Adicionar 3 funcionalidades inteligentes à Lista de Compras, mantendo o fluxo manual atual intacto:

1. **Parser de texto livre via IA** ("2kg arroz, leite, 6 bananas...")
2. **Estimativa de custo total** (preço médio BR, via IA)
3. **Adicionar ingredientes da Receita** direto pra uma lista

Tudo usa **Lovable AI Gateway** (`google/gemini-3-flash-preview`) via edge functions — sem chamadas diretas do client.

---

## 1. Parser de texto livre — "Organizar Lista"

### UI (em `ShoppingListDetail.tsx`)
Novo card abaixo da linha de ações (Item / WhatsApp / Limpar):

```text
┌──────────────────────────────────────────┐
│ ✨ Adicionar vários itens                │
│ Digite tudo de uma vez. A IA organiza   │
│ por categoria e unidade.                 │
│ ┌────────────────────────────────────┐   │
│ │ Ex: 2kg arroz, leite, 6 bananas... │   │ ← Textarea
│ └────────────────────────────────────┘   │
│         [ ✨ Organizar lista ]           │ ← Botão
└──────────────────────────────────────────┘
```

- Card no padrão pink (`bg-[#FFD1E7] rounded-3xl p-4`)
- Textarea (3 linhas, `text-base` para evitar zoom no iOS)
- Botão `bg-[#FD46A1]` com loader enquanto processa
- Após sucesso: toast "X itens adicionados", limpa o textarea

### Edge function: `supabase/functions/shopping-parse-items/index.ts`
- Recebe `{ text: string }`, valida com Zod (max 1000 chars)
- Valida JWT do usuário
- Chama Lovable AI com **tool calling** para estrutura garantida:
  ```json
  {
    "items": [
      { "name": "Arroz", "quantity": 2, "unit": "kg", "category": "mercearia" },
      { "name": "Leite", "quantity": 1, "unit": "L", "category": "laticinios" },
      { "name": "Banana", "quantity": 6, "unit": "un", "category": "hortifruti" }
    ]
  }
  ```
- System prompt em PT-BR com lista das `SHOPPING_CATEGORIES` e `SHOPPING_UNITS` válidas, regras (singularizar nome, default qty=1 unit=un, mapear sinônimos pra categoria correta)
- Retorna JSON; cliente itera e usa `addItem` do hook existente (mantém RLS por user_id)
- Trata erros 429/402 com mensagens claras

---

## 2. Estimativa de custo total

### UI (em `ShoppingListDetail.tsx`)
Pequeno card discreto entre o header e as ações, **só aparece quando há itens** (≥1):

```text
┌─────────────────────────────────────┐
│ 💰 Estimativa: ~R$ 87,50            │
│ Preços médios BR · [Recalcular]     │
└─────────────────────────────────────┘
```

- `bg-white/70 backdrop-blur` arredondado, fonte pequena
- Botão "Estimar custo" inicial (lazy — só calcula quando o usuário clica, pra não gastar IA toda vez que abre a lista)
- Após calcular: mostra valor + data; botão vira "Recalcular"
- Estado guardado em `localStorage` por listId (`shopping-cost-${listId}` com `{ total, calculatedAt, itemsHash }`); se hash dos itens mudou, mostra aviso "Lista mudou — recalcular"

### Edge function: `supabase/functions/shopping-estimate-cost/index.ts`
- Recebe `{ items: [{ name, quantity, unit }] }`, valida com Zod
- Chama Lovable AI com tool calling:
  ```json
  {
    "total_brl": 87.5,
    "currency": "BRL",
    "breakdown": [
      { "name": "Arroz", "estimated_price": 18.0 },
      ...
    ],
    "notes": "Preços médios de mercado em SP/2026"
  }
  ```
- System prompt instrui: estimar preço médio brasileiro (varejo grande rede), considerar quantidade × unidade
- Cliente exibe só o `total_brl`; `breakdown` fica disponível pra futura expansão

---

## 3. Adicionar ingredientes da Receita

### UI (em `RecipeDetails.tsx`)
Novo botão no fim da seção de Ingredientes:

```text
[ 🛒 Adicionar à lista de compras ]
```

Ao clicar, abre um **modal de seleção de lista** (`SelectShoppingListModal` novo):
- Lista as `shopping_lists` existentes (do hook `useShoppingLists`)
- Opção "+ Criar nova lista" no topo (abre `CreateListModal` em sequência)
- Após escolher: chama edge function pra normalizar os ingredientes da Spoonacular (que vêm em inglês via `extendedIngredients`)

### Edge function: `supabase/functions/shopping-from-recipe/index.ts`
- Recebe `{ ingredients: [{ original, name, amount, unit }], list_id }`
- Valida JWT + ownership da lista (RLS já protege INSERT)
- Chama Lovable AI: traduz pra PT-BR, normaliza unidade pro nosso enum, atribui categoria
- Insere itens via Supabase service role (ou retorna pro client inserir com `addItem`) — **preferência**: retornar a lista normalizada e o client insere usando o hook existente, mantendo RLS do usuário e atualizando UI imediata
- Toast: "X ingredientes adicionados a [Nome da Lista]" + botão "Ver lista" que navega

---

## Detalhes técnicos

### Arquivos a criar
- `supabase/functions/shopping-parse-items/index.ts`
- `supabase/functions/shopping-estimate-cost/index.ts`
- `supabase/functions/shopping-from-recipe/index.ts`
- `src/components/shopping/ParseItemsCard.tsx` (card de texto livre)
- `src/components/shopping/CostEstimateCard.tsx` (card de estimativa)
- `src/components/shopping/SelectShoppingListModal.tsx` (modal seleção de lista)

### Arquivos a editar
- `src/pages/ShoppingListDetail.tsx` — incluir os 2 cards novos
- `src/components/RecipeDetails.tsx` — botão "Adicionar à lista"
- `src/hooks/useShoppingLists.ts` — adicionar `addItemsBulk(items[])` para inserção em batch (usado pelos 3 features)

### Padrões a respeitar (memória)
- Cards: `bg-[#FFD1E7] rounded-3xl`, título sem ícone decorativo, `text-base`
- Modal: glassmorphism `bg-white/70 backdrop-blur-md border-2 border-[#FD46A1]`
- Botão close: `bg-[#FD46A1]` com X branco
- Inputs/Textarea: `text-base` mínimo (evita zoom iOS)
- AI: sempre via Lovable AI Gateway, edge function, tool calling para JSON estruturado
- Tratar 429 (rate limit) e 402 (créditos) com toast amigável

### Fora de escopo (pra não inflar a feature)
- Histórico de listas geradas
- Ajuste manual de unidades dentro do modal de parser (usuário pode editar item-a-item depois)
- Breakdown detalhado de custo por item (só total)

---

## Resumo do que muda na UX

1. Na tela de uma lista: agora há um **card de texto livre** + um **card de estimativa de custo** (lazy)
2. Na tela de uma receita: novo **botão "Adicionar à lista de compras"**
3. Modal manual de adicionar item permanece exatamente como está