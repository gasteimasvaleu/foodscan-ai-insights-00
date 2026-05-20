## Mudança
No header do chat do venue em `src/pages/ToAquiChat.tsx`, remover o parágrafo "X pessoa(s) online" (linhas 753-756) — já existe o ícone `Users` à direita que abre o modal com a lista.

## Detalhes
- Apagar o `<p>` com `Users` + `onlineCount`.
- Manter o `<h1>` com o nome do venue.
- Sem outras mudanças (botão e modal de online continuam intactos).