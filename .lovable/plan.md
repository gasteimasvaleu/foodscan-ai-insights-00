## Objetivo
Melhorar a UX da página individual do produto (`/mercado-facil/produto/:id`) agrupando as informações em cards glassmorphism e fixando o botão "Adicionar ao carrinho" no rodapé, seguindo a direção visual escolhida (Glass + selo vendedor).

## Mudanças em `src/pages/mercado-facil/Produto.tsx`

1. **Imagem hero**
   - Manter `aspect-square`, trocar `rounded-3xl` por `rounded-[2rem]` para casar com o protótipo. Fundo `#FFD1E7` mantido para fallback.

2. **Card principal (nome + preço)**
   - `bg-[#FFD1E7]/40 backdrop-blur-md rounded-3xl p-6 border border-[#FFD1E7]`
   - Nome do produto em destaque + linha com preço grande (`text-3xl font-extrabold text-[#FD46A1]`) e unidade ao lado (`/ por un`).
   - Mostrar preço promocional em destaque e, se houver `preco_promo_centavos`, exibir o `preco_centavos` original riscado ao lado.

3. **Card de descrição** (renderizado só se `produto.descricao`)
   - `bg-[#FFD1E7]/20 rounded-3xl p-6 border border-[#FFD1E7]/40`
   - Título "Descrição" em caps pequeno `text-xs font-bold text-[#FD46A1] uppercase tracking-[0.15em]` + corpo do texto.

4. **Selo do vendedor** (clicável, navega para a loja)
   - Linha com avatar quadrado arredondado `w-12 h-12 bg-[#FFD1E7] rounded-2xl` com a inicial do nome em `#FD46A1` (ou `loja.logo_url` se existir).
   - Label "Vendido por" pequeno + nome da loja em destaque.
   - `onClick` navega para `/mercado-facil/loja/:loja_id` (rota já existente no marketplace).

5. **CTA fixo no rodapé**
   - Wrapper `fixed bottom-0 inset-x-0 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] bg-gradient-to-t from-background via-background/95 to-transparent z-40`.
   - Botão `w-full bg-[#FD46A1] rounded-2xl h-14 text-base font-bold shadow-lg shadow-[#FD46A1]/30`.
   - Aumentar `pb-` do `<main>` para `pb-40` para não sobrepor.

## Fora do escopo
- Quantidade/stepper, avaliações, badges de estoque, edição de dados do produto, mudanças no header global ou no carrinho.
- Sem mudanças de banco, tipos ou lógica de carrinho.
