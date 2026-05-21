## Problema

A página `/masterchef` chama a edge function `generate-menu`, e o cliente recebe `FunctionsFetchError: Failed to send a request to the Edge Function` (CORS / fetch falhando). Duas causas:

1. **OPENAI_API_KEY não está configurada** nos secrets do projeto. A função usa `Deno.env.get('OPENAI_API_KEY')`, falha no boot/execução e o retorno nunca chega ao cliente.
2. **CORS incompleto** em `supabase/functions/generate-menu/index.ts`. Os headers permitem apenas `authorization, x-client-info, apikey, content-type`, mas o cliente Supabase envia `x-app-platform` (ver `src/integrations/supabase/client.ts`) e outros headers `x-supabase-client-*`. O preflight é rejeitado e vira "Failed to fetch".

## Solução proposta

Migrar `generate-menu` para o **Lovable AI Gateway** (já temos `LOVABLE_API_KEY` configurada, padrão do projeto) e ampliar os CORS headers, alinhando ao padrão usado em `spoonacular-recipes`.

### Mudanças em `supabase/functions/generate-menu/index.ts`

- Substituir `OPENAI_API_KEY` + endpoint OpenAI por chamada ao Lovable AI Gateway:
  - URL: `https://ai.gateway.lovable.dev/v1/chat/completions`
  - Header: `Authorization: Bearer ${LOVABLE_API_KEY}`
  - Model: `google/gemini-2.5-flash` (default rápido e gratuito do gateway)
  - Tratar status `429` (rate limit) e `402` (créditos esgotados) com mensagens amigáveis em PT-BR.
- Ampliar `corsHeaders`:
  ```ts
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-app-platform, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version'
  ```
- Manter o prompt e o parsing do JSON exatamente como estão (sem mudar UX do MasterCheFIT).
- Adicionar `response_format: { type: "json_object" }` para reduzir falhas de parse.

### Sem mudanças no frontend

`src/pages/MasterCheFIT.tsx` continua igual — mesmo contrato de entrada/saída.

### Fora de escopo

- Mudanças visuais no MasterCheFIT.
- Outras edge functions com o mesmo problema de CORS (posso tratar depois se quiser).

## Validação

Após aplicar:
1. Recarregar `/masterchef`, clicar em "Gerar Cardápio Personalizado".
2. Conferir nos logs da função `generate-menu` se houve chamada com status 200.
3. Confirmar que o cardápio aparece em tela.