# Banner do Quiz na Home: R$ 500 para R$ 100

## O que muda
- No banner do Quiz na Home, os textos passam a dizer:
  - "Prêmio de R$100"
  - "Fique em 1º no ranking do Quiz e leve R$100. Bora jogar agora!"
- A descrição para leitores de tela também passa para R$100.

## Atenção
- Se a própria imagem do banner tiver "R$500" escrito nela, essa parte não muda com o texto. Nesse caso, é preciso enviar uma imagem nova.

## Detalhes técnicos
- `src/components/NoveltyCard.tsx`: trocar "R$500" por "R$100" no aria-label, no alt da imagem e nos dois parágrafos.
