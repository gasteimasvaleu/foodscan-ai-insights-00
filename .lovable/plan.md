## Problema

Ao clicar em "IA" em `/admin/quiz`, o frontend mostra "Erro ao gerar quiz". Nos logs da edge function `quiz-generate` só aparecem requisições `OPTIONS` (preflight) — nenhum `POST` chega a ser registrado. O console do cliente mostra o mesmo padrão de "Failed to fetch" que já ocorre com outras functions.

A causa é o import:

```ts
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
```

Esse subpath `/cors` não existe no pacote `@supabase/supabase-js`. O símbolo `corsHeaders` chega como `undefined`, então as respostas saem sem cabeçalhos CORS e o navegador bloqueia o resultado.

## Correção

Em `supabase/functions/quiz-generate/index.ts`:

- Remover o import `from 'npm:@supabase/supabase-js@2/cors'`.
- Declarar `corsHeaders` localmente no topo do arquivo:
  ```ts
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  ```
- Manter o restante do fluxo (validação de admin, chamada ao Lovable AI Gateway com `tool_choice`, retorno do quiz).

## Verificação

1. Após o deploy automático, abrir `/admin/quiz`, criar um novo quiz, preencher título/descrição/tema/dificuldade/nº de perguntas e clicar em "IA".
2. Confirmar nos logs da edge function que aparece um `POST 200`.
3. Confirmar no preview que as perguntas aparecem no editor sem o toast de erro.
