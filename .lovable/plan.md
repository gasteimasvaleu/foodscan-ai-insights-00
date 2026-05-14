# Reposicionar imagem do card "Conquistas" para cima

## Mudança
Em `src/components/TertiaryDeckRow.tsx`, linha 45, trocar `object-cover` por `object-cover object-top` no `<img>` do card de Conquistas, para ancorar a imagem no topo do card (deslocando o conteúdo visualmente para cima dentro do recorte).

Caso o usuário queira um deslocamento mais sutil, alternativa: usar `object-[center_20%]` ou `object-[center_top]` (equivalente).

## Fora do escopo
- Não alterar o card esquerdo (Desafio 14 Dias).
- Não mexer em layout, aspect-ratio ou badge.
