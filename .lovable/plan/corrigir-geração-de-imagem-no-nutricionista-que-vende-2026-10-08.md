# Corrigir geração de imagem no Nutricionista que Vende

## O que está acontecendo
Os registros mostram que a função de imagem só liga e desliga: nenhum pedido chega até ela. É o mesmo problema que tivemos em Finanças. O navegador bloqueia o pedido porque a função não aceita alguns dados extras que o app envia em toda chamada. A função de legenda tem a mesma lista incompleta, então pode falhar do mesmo jeito.

## Correção
1. **generate-social-image** e **generate-social-caption**: completar a lista de permissões para aceitar todos os dados extras que o app envia.
2. Trocar o modelo de imagem antigo pelo modelo padrão atual do Lovable AI, que é mais estável. O resultado salvo continua igual.
3. Mostrar mensagens claras em português quando houver limite de uso ou os créditos acabarem, em vez de "Tente novamente".
4. Testar gerando um post e confirmar que a imagem e a legenda aparecem.

## Detalhes técnicos
- Permissões CORS: `authorization, x-client-info, apikey, content-type, x-app-platform, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`.
- Imagem: `openai/gpt-image-2.5-sunburst` pelo endpoint de imagens do gateway; a resposta em base64 continua sendo enviada para o bucket `social-posts`.
- Ler os erros 429/402 em `NutricionistaQueVende.tsx` e mostrar o aviso certo.
