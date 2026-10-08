# Corrigir o Provador e as outras funções com o mesmo bloqueio

## O que está acontecendo
É o mesmo problema de Finanças e do Nutricionista que Vende. O app envia uma informação extra em toda chamada (qual aparelho o cliente usa). A função do Provador não aceita essa informação, então o navegador bloqueia o pedido e aparece "Failed to send a request to the Edge Function".

Verifiquei todas as funções do app: **33 delas** têm a mesma falha. Entre as que o app usa direto estão o Provador, o NutriCoach, a verificação da assinatura Pro, excluir conta, o gerador de bebê, sugestão de nomes, a lista de compras, a calculadora de metas com IA, calorias de exercícios e as notificações. Algumas podem estar falhando sem você ter percebido ainda.

## Correção
1. Liberar essa informação extra em todas as 33 funções de uma vez. Assim o problema não volta a aparecer em outra tela.
2. No Provador, tirar a checagem de login "na porta". A função continua exigindo login, porque já confere o usuário por dentro (igual ao Nutricionista que Vende).
3. Publicar todas as funções alteradas.
4. Testar que todas aceitam o pedido do navegador e que o Provador responde.

## Detalhes técnicos
- Em cada `index.ts` que define `Access-Control-Allow-Headers` sem `x-app-platform`, a lista passa a ser: `authorization, x-client-info, apikey, content-type, x-app-platform, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`.
- `supabase/config.toml`: adicionar `[functions.virtual-tryon] verify_jwt = false`. A validação continua com `auth.getUser(token)`.
- Webhooks (Hotmart, RevenueCat, WhatsApp) também recebem a lista nova. Isso não muda nada para eles, porque não são chamados pelo navegador.
- Verificação: preflight `OPTIONS` com `Access-Control-Request-Headers: x-app-platform` em cada função.
