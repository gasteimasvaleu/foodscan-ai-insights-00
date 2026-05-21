## Objetivo

Melhorar a UX do bloco de informações do produto em `/mercado-facil/produto/:id`, reaproveitando o mesmo padrão visual usado na ficha de treino (`/profile/workout`): card branco com glassmorphism, barra lateral em gradiente rosa, sombra suave e sub-blocos arredondados com fundo `#FFD1E7/30`.

## Mudanças em `src/pages/mercado-facil/Produto.tsx`

Hoje o conteúdo abaixo da foto é apenas uma sequência de `<h2>` / `<p>` soltos. Vou agrupar tudo dentro de um único card e organizar a hierarquia.

### Estrutura proposta

```text
[ foto quadrada — mantém ]

┌─ Card branco glassmorphism com barra lateral rosa ───────┐
│  Nome do produto (text-base)                             │
│  Vendido por <Loja>   ·   por unidade                    │
│                                                          │
│  ┌─ Bloco preço (fundo #FFD1E7/30, rounded-xl) ────────┐ │
│  │  R$ 12,90        [R$ 18,00 riscado se promo]        │ │
│  │  por kg / un / pacote                                │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─ Bloco descrição (se houver) ───────────────────────┐ │
│  │  Info ícone   texto da descrição                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                          │
│  [ Adicionar ao carrinho — botão rosa full width ]       │
└──────────────────────────────────────────────────────────┘
```

### Detalhes visuais (espelhando `WorkoutPlan.tsx` linhas 198-251)

- Card externo: `bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)]` + pseudo `before:` com gradiente `from-[#FD46A1] to-[#FF7AC0]` na borda esquerda; padding interno com `pl-5`.
- Título do produto em `text-base font-semibold` (Core rule: títulos de card normais, sem ícone decorativo).
- Linha secundária com loja + unidade usando `text-xs text-muted-foreground` separados por `·`.
- Bloco de preço: `rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4`. Preço principal `text-2xl font-bold text-[#FD46A1]`. Se houver `preco_promo_centavos`, mostra o `preco_centavos` ao lado em `text-sm line-through text-foreground/50` e um pequeno `Badge` "Promo" no canto.
- Bloco de descrição (apenas se `produto.descricao`): mesmo padrão do `executionTip` no workout — `flex gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3` com ícone `Info` em `text-[#FD46A1]` e parágrafo `text-xs leading-relaxed`.
- Botão "Adicionar ao carrinho" permanece, agora dentro do card, mantendo `bg-[#FD46A1] rounded-2xl h-12`.

### Fora de escopo

- Lógica do carrinho, busca de dados, navegação.
- Mudança no `MFHeader` ou na foto do produto.
- Novos campos de dados (avaliações, estoque, variações).