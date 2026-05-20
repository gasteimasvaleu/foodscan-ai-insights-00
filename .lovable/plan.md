## Aumentar imagem da mulher para encostar nas bordas do card

### Mudança em `src/pages/mercado-facil/Index.tsx`

**Card externo (linha 94)** — remover padding esquerdo e vertical para a imagem encostar:
- Trocar `p-4` por `pr-4 py-0 pl-0` (mantém só padding à direita)
- Manter `overflow-hidden` para a imagem respeitar o `rounded-3xl`

**Imagem (linhas 95–99)** — aumentar e encostar:
- Trocar `w-24 h-24 object-contain` por `w-32 h-32 object-cover object-left self-stretch`
- Assim a imagem fica maior (~128px), preenche a altura toda do card e encosta na borda esquerda/topo/baixo

**Card interno do texto** — adicionar `my-3` para compensar a remoção do padding vertical do card externo e manter respiro do texto.

### Fora de escopo
- Não trocar a imagem, texto, busca ou botões.