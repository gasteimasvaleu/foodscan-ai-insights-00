# Atualizar NoveltyCard para Promo Quiz R$500

## Alterações em `src/components/NoveltyCard.tsx`

1. **Imagem**: trocar `src` para `https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/0217792196146522b8720b6d986e81ce95e9b006de0a2cb27ba73_0.jpeg`
2. **Rota**: `Link to="/maternidade"` → `to="/quiz"`
3. **`aria-label`** e **`alt`**: atualizar para refletir a promo do quiz
4. **Faixa preta translúcida** (mantém `bg-black/55 backdrop-blur-sm`):
   - Tag superior: `PRÊMIO DE R$500`
   - Texto descritivo curto com CTA:
     > "Fique em 1º no ranking do Quiz e leve R$500. Bora jogar agora!"

## Fora do escopo
- Não alterar layout, animação, dimensões (aspect-[21/9]) nem o `ToAquiPromoCard`.
- Nenhuma mudança de regra de negócio do Quiz/ranking.

## Arquivo alterado
- `src/components/NoveltyCard.tsx`