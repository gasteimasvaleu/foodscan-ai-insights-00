

## Corrigir Provador: IA está ignorando a IMAGE B (roupa)

### Diagnóstico

O resultado retornou apenas a pessoa da IMAGE A porque o modelo `google/gemini-2.5-flash-image` (Nano Banana) tem dificuldade em distinguir qual imagem é "A" e qual é "B" quando ambas chegam apenas como URLs em sequência, sem rótulo explícito por imagem. Hoje a edge function envia:

```
[
  { type: "text", text: PROMPT longo mencionando "IMAGE A" / "IMAGE B" },
  { type: "image_url", image_url: { url: userImageUrl } },
  { type: "image_url", image_url: { url: outfitImageUrl } },
]
```

Não há nada que amarre cada URL ao rótulo correspondente, então o modelo trata as duas imagens como referências genéricas — e como a primeira (pessoa) é mais "rica" semanticamente, ele tende a só replicá-la.

### Correção (uma única edge function — `supabase/functions/virtual-tryon/index.ts`)

Reordenar o `content` da mensagem para **intercalar texto curto + imagem**, marcando explicitamente cada imagem antes dela aparecer. Estrutura nova:

```
[
  { type: "text", text: "Esta é a IMAGE A (pessoa de referência — use o rosto e identidade desta imagem):" },
  { type: "image_url", image_url: { url: userImageUrl } },
  { type: "text", text: "Esta é a IMAGE B (roupa/look — use EXATAMENTE esta roupa, ignore qualquer roupa visível na IMAGE A):" },
  { type: "image_url", image_url: { url: outfitImageUrl } },
  { type: "text", text: TRY_ON_PROMPT }, // instruções completas vêm por último
]
```

Mudanças adicionais no prompt para reforçar:
- Abrir o `TRY_ON_PROMPT` com: "Você acabou de receber DUAS imagens, nesta ordem: IMAGE A (pessoa) e IMAGE B (roupa). Sua tarefa é gerar UMA nova imagem combinando-as." — em vez de só "Você recebe DUAS IMAGENS".
- Mover a "REGRA #1 — ROUPA INTOCÁVEL" para logo após essa abertura, antes de qualquer outra seção.
- Adicionar uma instrução final explícita: "OUTPUT: gere uma imagem nova, NÃO retorne nenhuma das imagens de entrada inalterada."
- Reforçar negative: "não retornar a IMAGE A sem alterações", "não retornar a IMAGE B sem alterações".

### Fora do escopo
- Trocar de modelo (continuamos com `google/gemini-2.5-flash-image`).
- Mudar o frontend (`Provador.tsx`, `TryOnUpload.tsx`) — o problema é 100% no payload da edge function.
- Tabela de histórico ou logs persistentes.

### Como vamos validar
Após o deploy, você testa na rota `/provador` com as mesmas duas fotos. Se ainda voltar só a IMAGE A, o próximo passo (fora deste plano) seria considerar trocar para `google/gemini-3.1-flash-image-preview` (Nano Banana 2), que segue instruções multi-imagem com mais fidelidade.

### Arquivos editados
- `supabase/functions/virtual-tryon/index.ts` — apenas o array `content` da chamada ao gateway e o texto de `TRY_ON_PROMPT`.

