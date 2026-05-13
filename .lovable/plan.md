## Causa

As edge functions do quiz (`quiz-start-attempt`, `quiz-submit-answer`, `quiz-finish-attempt`) importam `corsHeaders` de `npm:@supabase/supabase-js@2/cors`, que não existe e faz a função quebrar em runtime — mesmo bug que já corrigimos na `quiz-generate`. Por isso `init()` em `QuizPlay.tsx` recebe erro do invoke e mostra o toast "Erro ao iniciar".

## Correção

Em cada uma das 3 funções:

- Remover `import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'`.
- Declarar localmente no topo:
  ```ts
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-platform',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  ```
- Manter o resto do arquivo idêntico (handler, helper `json`, lógica).

## Deploy e validação

- Deploy das 3 funções.
- Testar `quiz-start-attempt` via `curl_edge_functions` com auth da sessão para confirmar 200.
- Conferir no preview (/quiz → escolher quiz) que não aparece mais o toast "Erro ao iniciar".

Sem mudanças no frontend, banco ou outras funções.