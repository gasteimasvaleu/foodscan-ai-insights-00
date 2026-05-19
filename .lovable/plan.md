## Plano

1. **Corrigir a Edge Function `venue-mystery-hint`**
   - Trocar a importação de CORS que pode falhar no runtime por headers definidos diretamente no arquivo.
   - Garantir que `OPTIONS` e todas as respostas retornem CORS corretamente.
   - Melhorar o tratamento de erro para retornar uma mensagem amigável em vez de quebrar com “Failed to send request”.

2. **Ajustar autenticação da função**
   - Como o botão é usado dentro do app por usuário logado, manter a chamada pelo `supabase.functions.invoke`.
   - Se necessário, deixar a função com `verify_jwt = false` e validar em código apenas o que for essencial para evitar bloqueio por ausência/intermitência do header no preview/webview.

3. **Simplificar o retorno da IA**
   - Remover dependência de `tool_choice/function calling`, que pode variar entre modelos.
   - Pedir JSON simples ao AI Gateway e fazer fallback para dividir texto em até 3 dicas se o JSON vier malformado.

4. **Validar após a correção**
   - Reimplantar/testar a Edge Function diretamente.
   - Confirmar que ela retorna `{ hints: [...] }` com uma pista real antes de considerar resolvido.

## Detalhes técnicos

- Arquivo principal: `supabase/functions/venue-mystery-hint/index.ts`
- Possível ajuste adicional: `supabase/config.toml`
- Não serão feitas mudanças visuais no modal nem no fluxo do chat.