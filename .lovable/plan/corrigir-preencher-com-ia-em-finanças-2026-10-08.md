# Corrigir "Preencher com IA" em Finanças

## O que está acontecendo
O app envia uma informação extra em toda chamada (qual aparelho o cliente usa: iPhone, Android ou web). A função que lê o comprovante não está liberada para receber essa informação. Por isso o navegador bloqueia o pedido antes de ele chegar à função, e aparece "Failed to send a request to the Edge Function". Os registros confirmam isso: a função inicia, mas nenhuma leitura chega até ela.

## Correção
1. **scan-receipt**: trocar a lista padrão de permissões de acesso por uma lista própria que também aceite `x-app-platform`. As outras funções que já funcionam usam essa mesma lista.
2. Trocar a leitura da imagem para o modelo padrão atual do Lovable AI. A extração em formato estruturado continua igual: valor, descrição, categoria, data, estabelecimento e confiança.
3. Mostrar mensagens claras em português quando houver limite de uso ou os créditos acabarem.
4. Testar com uma foto de comprovante e confirmar que valor, data e categoria são preenchidos.

## Detalhes técnicos
- Cabeçalhos CORS: `authorization, x-client-info, apikey, content-type, x-app-platform` e os cabeçalhos `x-supabase-client-*`.
- Nenhuma mudança na tela.
