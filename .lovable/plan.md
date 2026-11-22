# Trocar "Logar" por "Adicionar"

## O que muda
- Tela Registrar refeição: o botão "Logar" passa a dizer "Adicionar".
- Aba Minhas Receitas: o botão "Logar 1 porção" passa a dizer "Adicionar 1 porção", para manter o mesmo padrão.
- O botão continua funcionando do mesmo jeito. Só o texto muda.

## Detalhes técnicos
- `src/pages/AdicionarRefeicao.tsx` linha 165 e `src/components/MyRecipesTab.tsx` linha 183: trocar só o texto. No iPhone, a mudança chega por um Live Update.
