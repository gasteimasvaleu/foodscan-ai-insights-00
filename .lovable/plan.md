

## Alterar layout do RecentScans para lista vertical

### Alteração em `src/components/RecentScans.tsx`

Trocar o layout de scroll horizontal (cards lado a lado) para uma lista vertical onde cada item ocupa uma linha inteira, com a imagem à esquerda (thumbnail pequena) e informações à direita, empilhados um abaixo do outro.

**Mudanças:**
- Substituir o container `flex gap-3 overflow-x-auto` por `flex flex-col gap-3`
- Cada card passa de vertical (imagem em cima, texto embaixo) para horizontal (imagem à esquerda, texto à direita) usando `flex flex-row`
- Thumbnail quadrada pequena (~16x16 / 64px) com `rounded-xl`
- Remover `flex-shrink-0 w-36` e usar `w-full`
- Nome, calorias e horário ficam à direita da imagem

