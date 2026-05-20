## Padronizar fundo + bordas rosas no Mercado Fácil

### 1. Fundo das páginas

Trocar `bg-[#F7FAFB]` por `bg-gradient-primary` (padrão usado em FoodScan, FitTracker, About, etc.) em todas as 12 páginas e ecrãs de loading:

- `Index.tsx`, `Carrinho.tsx`, `Categoria.tsx`, `Loja.tsx`, `Produto.tsx`
- `LojistaDashboard.tsx`, `LojistaConfigLoja.tsx`, `LojistaProdutos.tsx`, `LojistaPedidos.tsx`
- `EntregadorCadastro.tsx`, `EntregadorDashboard.tsx`, `EntregadorEntregas.tsx`

### 2. Borda rosa nos cards e botões brancos

Para todo elemento que use `bg-white rounded-3xl` (cards) ou `bg-white rounded-2xl/full` (botões/ícones), acrescentar `border border-[#FD46A1]/30` (sutil, no padrão glassmorphism do app).

Aplica nos arquivos acima sempre que aparecer `bg-white rounded-...`. Especificamente:

- Cards de pedidos, entregas, produtos, lojas, dashboards
- Inputs internos do carrinho que usam `bg-[#F7FAFB]` também ganham `border border-[#FD46A1]/30` para legibilidade sobre o novo fundo gradient
- Botões com fundo branco e texto rosa (ex.: `bg-white text-[#FD46A1]`) recebem `border-2 border-[#FD46A1]` (já existem em alguns lugares, padronizar)

### Não incluído

- Não vou mudar o header rosa (`MFHeader`).
- Não vou tocar nos botões já rosa-preenchidos (`bg-[#FD46A1]`).
- Não vou mexer em modais (já têm padrão glassmorphism).
- Não vou ajustar paddings/sombras.