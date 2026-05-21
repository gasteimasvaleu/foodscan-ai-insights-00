## Diagnóstico

O erro atual no `/masterchef` é `FunctionsFetchError: Failed to send a request to the Edge Function`, ou seja: o navegador não está conseguindo completar a chamada para `generate-menu`.

A função em si responde corretamente quando chamada diretamente pelo backend, então o problema mais provável não é a IA nem o JSON do cardápio. A correção anterior resolveu a execução da função, mas ainda precisamos ajustar a chamada/implantação para o app web.

## Plano de correção

1. **Registrar `generate-menu` no `supabase/config.toml`**
   - Adicionar uma seção explícita para a função.
   - Como a página já exige usuário logado/Pro antes de abrir o MasterCheFIT, manter a função protegida com JWT (`verify_jwt = true`).

2. **Tornar a chamada frontend mais robusta**
   - Buscar a sessão atual antes de chamar a função.
   - Enviar explicitamente o `Authorization: Bearer <access_token>` no `supabase.functions.invoke('generate-menu')`.
   - Isso evita falhas intermitentes do client ao não anexar o token corretamente.

3. **Mostrar erro real no toast**
   - Quando a função retornar erro específico, exibir a mensagem real em vez do texto genérico “Não foi possível gerar...”.
   - Assim, se for limite de IA, créditos, autenticação ou CORS, o usuário verá a causa correta.

4. **Validar após implementar**
   - Fazer deploy/teste da edge function `generate-menu`.
   - Testar uma chamada real com ingredientes e requisitos semelhantes aos do print.
   - Confirmar que a função retorna o cardápio e que o frontend não cai mais no toast genérico.

## Arquivos a alterar

- `supabase/config.toml`
- `src/pages/MasterCheFIT.tsx`

## Fora do escopo

- Não vou alterar o visual da página.
- Não vou mexer nas regras Pro/subscription.
- Não vou alterar outras funções de IA.