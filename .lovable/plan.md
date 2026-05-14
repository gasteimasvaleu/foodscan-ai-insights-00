## Causa

A função `generate-home-recipe` falha no preflight CORS porque o cliente envia o header `x-app-platform` (configurado em `src/integrations/supabase/client.ts`), mas a função só permite:

```
"authorization, x-client-info, apikey, content-type"
```

A `identify-dish` já inclui `x-app-platform` e por isso a primeira etapa funciona. Quando você toca uma das opções (pizza), a segunda chamada quebra com "Failed to send a request to the Edge Function".

## Correção

Em `supabase/functions/generate-home-recipe/index.ts`, adicionar `x-app-platform` ao `Access-Control-Allow-Headers`:

```ts
"Access-Control-Allow-Headers":
  "authorization, x-client-info, apikey, content-type, x-app-platform",
```

Sem outras mudanças.