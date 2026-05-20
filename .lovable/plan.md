# Investigação

Confirmei via banco e via API REST (anon key) que o produto promocional existe e a query do hook **retorna corretamente** o item:

- `mf_produtos`: `sanduiche hamburguer`, `ativo=true`, `preco=20,00`, `promo=10,00`
- `mf_lojas` "Teste": `ativa=true`
- Resposta REST com o embed `loja:mf_lojas!inner(...)`: retorna 1 linha ✅
- RLS de `mf_produtos` e `mf_lojas` permite leitura pública

Ou seja: **a query funciona**. O motivo mais provável de você não ver o carrossel agora:

1. **Cache do React Query** com `staleTime: 5min` — a primeira visita carregou `[]` (antes do produto existir) e ficou armazenado; ao voltar não refetcha.
2. Não há invalidação após o lojista criar/editar um produto com promo, então mesmo recarregando dentro da janela de 5 min o carrossel pode ficar vazio para a sessão que cadastrou.
3. Quando há filtro/busca ativo no topo da página (`showFiltered = true`), o carrossel é escondido por design — talvez tenha clicado em "Promoções".

# Plano (apenas frontend, sem mudança de schema)

### 1. `src/hooks/mercado-facil/useOfertasDestaque.ts`
- Trocar `staleTime: 5 * 60 * 1000` por `staleTime: 30 * 1000` e adicionar `refetchOnMount: "always"` e `refetchOnWindowFocus: true`. Garante que ao voltar para `/mercado-facil` o carrossel reflita produtos recém-cadastrados.

### 2. Invalidação após CRUD de produto do lojista
- Em `src/pages/mercado-facil/lojista/ProductForm*` (ou local equivalente onde lojista salva/edita produto), após sucesso de insert/update/delete chamar:
  ```ts
  queryClient.invalidateQueries({ queryKey: ["mf-ofertas-destaque"] });
  ```
- Vou localizar o arquivo correto antes de editar (provável `src/pages/mercado-facil/lojista/Produtos.tsx` ou similar).

### 3. Diagnóstico visível no carrossel (opcional, leve)
- Atualmente `if (!data || data.length === 0) return null;` — esconde tudo silenciosamente. Trocar por:
  - se `isError`: log no console + retornar null
  - se `data.length === 0`: continuar retornando null (UX limpa, sem seção vazia)
- Mantém comportamento atual; só adiciona um `console.warn` em erro para facilitar debug futuro.

# Fora de escopo

- Não vou mexer em RLS, schema, edge functions ou UX dos outros blocos.
- Não vou criar painel admin para curar ofertas (decisão anterior: 100% automático).

# Como validar depois

1. Hard reload em `/mercado-facil` → o card "sanduiche hamburguer -50%" aparece entre Categorias e Lojas.
2. Editar preço promo no painel lojista → ao voltar para a home, carrossel atualiza sem precisar reload manual.

Se aprovar, sigo com a implementação.
