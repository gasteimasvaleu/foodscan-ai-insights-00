

## Reordenar: card de progresso acima do botão

Mover o bloco "Progresso semanal" (linhas 42-49) para antes do botão "Adicionar Objetivo" (linhas 51-59). Na prática a ordem já é essa no código — o card de progresso já está acima do botão.

Relendo o código, a ordem atual é: Header → Progresso semanal → Botão → Lista. Isso já é o que o usuário pede.

Porém, o usuário quer que o card de progresso fique **fixo/visível** e não role junto com os cards de objetivos. A solução é separar o layout em duas partes: uma parte fixa (header + progresso + botão) e uma parte scrollável (lista de objetivos).

### Alteração em `src/pages/Objetivos.tsx`

- Reestruturar o layout para que header, card de progresso semanal e botão fiquem em uma seção fixa no topo
- A lista de objetivos fica em uma área com scroll independente abaixo
- Usar `flex flex-col` no container principal e `overflow-y-auto` na lista de cards

