# Corrigir de vez a imagem do Nutricionista que Vende

## O que encontrei
- A função de imagem responde quando eu a chamo de fora: o bloqueio do navegador foi resolvido.
- O novo modelo de imagem funciona: gerou uma imagem no meu teste.
- Mesmo assim, os registros da função não mostram nenhum erro quando você clica. Isso indica que o pedido é barrado **antes** do nosso código rodar, ou que a função é encerrada sem aviso.
- Não consigo entrar com a sua conta para repetir o clique, então a causa exata ainda não está confirmada. Há duas suspeitas fortes:
  1. **Barreira de login na porta da função**: esta função (e a da legenda) está configurada para checar o login antes de entrar. Com o formato de login mais novo do Supabase, essa checagem pode recusar pedidos válidos. Já a função de Finanças funcionou depois que desligamos essa checagem.
  2. **Imagem pesada demais**: o novo modelo devolve um PNG grande, e o jeito atual de converter esse arquivo gasta muito processamento. Isso pode fazer a função ser encerrada no meio.

## Correção
1. Desligar a checagem de login "na porta" para as funções de imagem e legenda. A função continua exigindo login: ela já confere o usuário por dentro, do mesmo jeito que em Finanças.
2. Pedir a imagem em JPEG (bem mais leve) e trocar a conversão por uma forma rápida, que gasta pouco processamento.
3. Registrar cada etapa nos registros da função (pedido recebido, IA respondeu, upload feito), para que qualquer falha futura apareça claramente.
4. Mostrar no aviso de erro o motivo real devolvido pela função, em português, em vez de sempre "Tente novamente em instantes".
5. Publicar as funções e pedir que você clique de novo. Depois, confirmar nos registros que a imagem foi gerada e salva.

## Detalhes técnicos
- `supabase/config.toml`: `verify_jwt = false` em `generate-social-image` e `generate-social-caption`. A validação continua com `auth.getUser(token)`.
- Imagem: adicionar `output_format: "jpeg"` no corpo do `/v1/images/generations`. Decodificar com `decodeBase64` de `jsr:@std/encoding/base64` em vez de `Uint8Array.from(atob(...))`. Upload com `image/jpeg`.
- Logs com `console.log` por etapa, status e trecho do corpo nos erros do gateway.
- Front: ler `error.context` (Response) do `functions.invoke` e mapear `unauthorized`, `rate_limit`, `no_credits`, `ai_error`, `upload_failed` para mensagens em PT-BR.
