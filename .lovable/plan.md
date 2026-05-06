## Problema

A edge function `analyze-nutrition` (usada pela Análise de Imagem do FoodScan) está quebrando com o erro:

```
TypeError: userClient.auth.getClaims is not a function
    at enforceFoodscanQuota (analyze-nutrition/index.ts:44)
```

## Causa raiz

A função importa o SDK na versão antiga:
```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
```

O método `auth.getClaims(token)` só existe a partir do `@supabase/supabase-js` **v2.57+**. Na 2.45.0 esse método simplesmente não existe — daí o `TypeError`. Toda chamada à função falha imediatamente quando vem do iOS nativo (que ativa o quota check), e mesmo na web a função morre antes de processar a imagem caso o header `x-app-platform` chegue como `ios-native`.

Outras funções do projeto (ex.: `whatsapp-process-image`) já usam `2.57.4` e não apresentam esse erro.

## Correção

Atualizar o import do supabase-js em `supabase/functions/analyze-nutrition/index.ts`:

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
```

Nenhuma outra alteração de lógica é necessária — o resto da função (`enforceFoodscanQuota`, chamada à OpenAI, commit de uso diário) está correto e o `getClaims` passará a existir.

## Verificação após o fix

1. Conferir nos Edge Function logs que não aparece mais `getClaims is not a function`.
2. Testar o FoodScan no preview enviando uma foto — a análise deve retornar `foodName` + `nutrition` normalmente.
