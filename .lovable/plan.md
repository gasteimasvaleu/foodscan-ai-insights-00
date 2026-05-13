## Diagnóstico

O erro continua porque, nos logs do Supabase, a chamada para `quiz-generate` está parando no `OPTIONS 200`: o `POST` não chega a aparecer. Isso indica bloqueio antes da chamada real do navegador, ainda na etapa de preflight/CORS.

Além disso, o frontend hoje mostra apenas “Erro ao gerar quiz”, sem expor o motivo real retornado pela Edge Function, o que dificulta confirmar se o próximo erro é CORS, autenticação/admin, secret ausente ou falha do AI Gateway.

## Plano de correção

1. **Tornar o CORS da `quiz-generate` mais robusto**
   - Ajustar `Access-Control-Allow-Headers` para aceitar também cabeçalhos adicionais enviados pelo Supabase/browser, como `x-app-platform` e `x-client-info`.
   - Manter CORS em todas as respostas, inclusive erros.

2. **Melhorar o diagnóstico no frontend**
   - Em `AdminQuiz.tsx`, registrar no console e mostrar no toast uma mensagem mais específica quando a geração falhar.
   - Diferenciar erros como: sem login, sem permissão admin, AI Gateway indisponível, limite/crédito, resposta inválida.

3. **Endurecer a resposta da Edge Function**
   - Validar melhor o JSON retornado pela IA antes de enviar ao frontend.
   - Garantir que o retorno sempre contenha `quiz.questions` com array válido.
   - Retornar erros claros (`invalid_ai_response`, `missing_lovable_api_key`, `forbidden`, etc.).

4. **Deploy e validação**
   - Fazer deploy imediato da Edge Function `quiz-generate`.
   - Testar a função novamente via ferramenta de Edge Function.
   - Conferir logs para confirmar que o `POST` passou a chegar; se aparecer outro erro real depois disso, corrigir esse segundo ponto.