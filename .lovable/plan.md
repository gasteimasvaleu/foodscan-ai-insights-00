## Problema

A análise por imagem no FoodScan quebra com "Edge Function returned a non-2xx status code". No log da edge function `analyze-nutrition`:

```
Analyzing image first...
Error in analyze-nutrition function: Error: Failed to analyze image
```

Isso acontece na linha 160 — a chamada para a **OpenAI** (`gpt-4o` para descrever a imagem) retorna não-2xx e o código só joga `throw new Error('Failed to analyze image')` sem logar o motivo (status/body). As causas prováveis desse não-2xx são: `OPENAI_API_KEY` expirada/sem créditos, ou rate limit da OpenAI.

## Correção

Duas mudanças mínimas em `supabase/functions/analyze-nutrition/index.ts`:

1. **Logar o status e o body da resposta da OpenAI** antes de dar throw (nas duas chamadas, imagem e nutrição). Assim conseguimos ver a causa real nos logs em vez de "Failed to analyze image" genérico.

2. **Migrar a etapa de descrição da imagem (gpt-4o vision) para o Lovable AI Gateway** usando `google/gemini-3-flash-preview` com `LOVABLE_API_KEY`. O gateway é mais estável, tem créditos gerenciados pela Lovable e resolve o caso de a chave OpenAI ter expirado. O corpo é montado no formato chat-completions com bloco `image_url` (data URL). A etapa 2 (JSON nutricional) fica também migrada para o mesmo modelo do gateway para uniformizar e não depender mais da OpenAI.

3. **Tratamento de 429/402 do gateway**: retornar 429 com mensagem clara se rate limit, 402 se créditos esgotados — para o front exibir toast apropriado.

Nenhuma mudança no front-end é necessária; o contrato de `{ base64Image }` → `{ description, foodName, elements/nutrition }` permanece igual.

## Como validar

- Testar upload de imagem no FoodScan após deploy — deve gerar descrição e análise nutricional normalmente.
- Se falhar, o novo log mostrará status + body da resposta upstream para diagnóstico direto.
