

## Refinar Provador Virtual: roupa fiel + card 1:1

Dois ajustes pequenos com base no feedback do primeiro teste:

### 1. Prompt mais rígido para fidelidade da roupa
Em `supabase/functions/virtual-tryon/index.ts`, reescrever a constante `TRY_ON_PROMPT` para reforçar que a roupa da IMAGE B deve aparecer **exatamente igual** (modelo, cor, estampa, recortes, comprimento, tecido, acessórios), sem nenhuma reinterpretação. Mudanças principais:

- Trocar "TASK" para deixar claro: a IMAGE B é a **única fonte da roupa** — qualquer roupa visível na IMAGE A deve ser ignorada/descartada.
- Adicionar seção **"REGRA #1 — ROUPA INTOCÁVEL"** no topo, antes de tudo, listando:
  - Replicar pixel a pixel cor, estampa, textura, costuras, zíperes, bolsos, fivelas, decote, mangas, comprimento, caimento original.
  - Manter exatamente acessórios/calçados visíveis na IMAGE B (se houver), a menos que claramente não façam parte do look principal.
  - Proibido inventar variações, mudar tom, "modernizar", recolorir, adicionar logos novos ou remover detalhes.
  - Se a IMAGE B mostrar a peça em manequim/cabide/foto de produto, transferir o look para o corpo da pessoa **mantendo proporção e detalhes idênticos**.
- Trocar TASK para mencionar **proporção 1:1 (quadrada)** em vez de 9:16, já que o modelo `gemini-2.5-flash-image` está retornando 1:1 e vamos abraçar esse formato.
- Ajustar CENÁRIO: "Enquadramento quadrado 1:1, corpo inteiro centralizado, headroom equilibrado".
- Reforçar NEGATIVE com itens específicos:
  - "não trocar a cor da roupa por nenhuma hipótese"
  - "não mudar o modelo da peça"
  - "não adicionar/remover estampas, listras ou detalhes"
  - "não usar a roupa visível na IMAGE A"

### 2. Card de resultado em 1:1
Em `src/pages/Provador.tsx`, no bloco que renderiza a imagem gerada:

- Trocar o container que hoje força aspect ratio 9:16 (provavelmente `aspect-[9/16]`) por `aspect-square` (1:1).
- Manter `object-cover` e `rounded-3xl` existentes.
- Ajustar `max-w` se necessário para o card ficar visualmente equilibrado no mobile (ex.: `max-w-sm mx-auto`), sem alterar layout dos botões abaixo.

### Sem outras mudanças
- Edge function continua usando `google/gemini-2.5-flash-image`.
- Bucket `provador`, fluxo de upload, botões (Baixar / WhatsApp / Refazer / Trocar roupa) e VideoOverlay permanecem idênticos.
- Sem migration, sem novos arquivos, sem mudança de rota.

### Arquivos editados
- `supabase/functions/virtual-tryon/index.ts` — apenas a constante do prompt.
- `src/pages/Provador.tsx` — apenas o aspect ratio do card de resultado.

### Memória a atualizar
- `mem://features/provador/core` — trocar "formato 9:16" por "formato 1:1" para refletir a realidade do modelo.

### Fora do escopo
- Trocar de modelo de IA.
- Forçar 9:16 via pós-processamento (cropping/padding) — fica para depois, se você quiser voltar a esse formato.
- Mudar layout dos uploads ou dos botões de ação.

