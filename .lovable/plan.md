
Plano: corrigir ausência de registro em `subscribers` após compra + login Apple

O que confirmei
- O usuário `831a4023-e87a-4ef4-bf97-b6eed1b59dbc` existe em `auth.users`.
- O `profile` desse usuário existe.
- Não existe nenhuma linha em `public.subscribers` nem por `user_id` nem pelo email Apple relay.
- Não há logs recentes da Edge Function `revenuecat-webhook` para esse usuário.
- Portanto, não parece ser “sandbox da Apple”; é uma falha de sincronização do app e/ou do fallback servidor.

Causa provável
1. `syncSubscriptionAfterLogin()` faz `upsert(...)`, mas não verifica `error`; se o banco rejeitar a operação, a falha fica silenciosa.
2. No `AuthCard`, o retry pós-login depende do retorno de `logInRevenueCat(user.id)`. Hoje essa função retorna `null` se o SDK já estiver logado com o mesmo usuário, então o retry pode ser abortado cedo demais.
3. No `AppleSignInButton`, a sincronização depende de a entitlement já aparecer imediatamente após o login. Se houver atraso, não existe um segundo caminho confiável.
4. O webhook existe como backup, mas pelos logs ele não está cobrindo este caso.

Implementação
1. Endurecer `src/lib/revenuecat.ts`
- Fazer `syncSubscriptionAfterLogin()` validar o resultado real do `upsert`.
- Capturar `{ error }` e lançar/logar corretamente.
- Preferir sincronização por `user_id`, com fallback por `email` quando necessário.
- Retornar sucesso/fracasso em vez de engolir erros.

2. Corrigir o retry em `src/components/AuthCard.tsx`
- Após o login, sempre executar:
  - `await logInRevenueCat(user.id)`
  - `Purchases.getCustomerInfo()`
  - se houver entitlement ativa, `syncSubscriptionAfterLogin(...)`
- Remover a dependência de `customerInfo` vir do `logInRevenueCat`.

3. Corrigir o fluxo imediato em `src/components/AppleSignInButton.tsx`
- Após `signInWithIdToken`, fazer `await logInRevenueCat(data.user.id)`.
- Buscar `Purchases.getCustomerInfo()` logo depois.
- Chamar `syncSubscriptionAfterLogin(...)` com esse `customerInfo`, sem depender só de `checkSubscriptionStatus()`.
- Expor erro de sync em log/toast se a escrita no banco falhar.

4. Revisar o fallback servidor
- Validar `supabase/functions/revenuecat-webhook/index.ts` como rede de segurança.
- Confirmar que o webhook do RevenueCat está apontando para a função certa, já que não há logs recentes.

Resultado esperado
- Compra anônima + login Apple passa a criar/atualizar `subscribers` imediatamente.
- Se houver atraso no primeiro sync, o retry pós-login cobre o caso.
- O webhook continua mantendo renovações/cancelamentos sincronizados.

Detalhes técnicos
```text
Compra anônima RevenueCat
  -> Login Apple / Supabase
  -> RC logIn(user.id)
  -> Purchases.getCustomerInfo()
  -> syncSubscriptionAfterLogin()
  -> public.subscribers

Fallback:
RevenueCat webhook
  -> revenuecat-webhook
  -> public.subscribers
```
