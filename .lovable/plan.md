
Plano revisado: alinhar este projeto com a arquitetura do app que funciona

O que os logs mostram
- `check-subscription` autenticou o usuário `3c9cb17b-...` e retornou repetidamente `found:false`.
- `revenuecat-webhook` recebeu eventos anônimos para `$RCAnonymousID:8356...` e hoje está fazendo `skipping`.
- Houve também um evento para `831a4023-...`, mas sem criar linha em `subscribers`.
- No banco, existe um bloqueio importante: `subscribers_payment_provider_check` só aceita `stripe` e `hotmart`. Qualquer tentativa de gravar `payment_provider='apple'` tende a falhar.

Causa raiz provável
1. O app ainda não segue o fluxo robusto do outro projeto:
   - não inicializa RevenueCat no app start;
   - não centraliza `Purchases.logIn(userId)` no ciclo global de auth;
   - não faz retry + `restorePurchases()` dentro da sincronização principal.
2. O webhook atual descarta compras anônimas, então perde o “rastro” da compra antes do login.
3. A tabela `subscribers` não está preparada para o fluxo Apple/RevenueCat atual por causa do check constraint de `payment_provider`.

Implementação proposta

1. Corrigir a base de dados primeiro
- Criar migration para remover/substituir o check constraint de `payment_provider` e permitir Apple/RevenueCat.
- Manter compatibilidade com o app atual.
- Adicionar colunas auxiliares do fluxo que funciona:
  - `transaction_id` nullable
  - `subscription_status` nullable/default
  - `product_source` nullable
- Criar índice para `transaction_id`.
- Não remover as colunas atuais (`subscribed`, `subscription_tier`, `subscription_end`, `payment_provider`) para não quebrar a app existente.

2. Inicializar RevenueCat no app start
- Mover a configuração nativa iOS para `src/main.tsx`.
- Garantir que `Purchases.configure({ apiKey })` rode uma vez ao abrir o app, antes dos fluxos de compra/login.
- Manter o mutex atual do módulo para evitar double configure.

3. Reestruturar `src/lib/revenuecat.ts` para copiar a lógica vencedora
- Criar helpers claros:
  - `identifyUser(userId)` → `Purchases.logIn({ appUserID: userId })`
  - `checkSubscriptionStatus()`
  - `restorePurchases()`
  - `syncSubscriptionAfterLogin(userId, email)`
- Em `syncSubscriptionAfterLogin`:
  - fazer 3 tentativas de leitura de entitlement com pequeno intervalo;
  - se não vier ativa, executar `restorePurchases()` como fallback;
  - se ainda não houver assinatura ativa, sair sem criar registro;
  - se houver assinatura:
    - tentar claim de órfão por `transaction_id`;
    - depois claim por `email` se existir registro sem `user_id`;
    - depois update por `user_id`;
    - se não existir nada, insert novo.
- Padronizar os campos gravados:
  - `subscribed`
  - `subscription_tier`
  - `subscription_end`
  - `payment_provider`/`product_source`
  - `subscription_status`
  - `transaction_id`

4. Tirar a lógica crítica de dentro do `AuthCard`
- Hoje a sincronização está espalhada entre `AuthCard` e `AppleSignInButton`.
- Mover o fluxo principal para `src/hooks/useAuth.tsx` no `onAuthStateChange`, como no app que funciona:
  - sessão autenticada
  - `identifyUser(user.id)`
  - `syncSubscriptionAfterLogin(user.id, user.email)`
- Assim a associação do ID anônimo para o UUID real deixa de depender da tela estar montada no momento certo.

5. Simplificar `AppleSignInButton`
- Deixar o botão responsável por autenticar com Apple + Supabase.
- Remover dele a responsabilidade principal da sincronização de assinatura.
- No máximo, manter um fallback leve de sync após login bem-sucedido, mas a fonte de verdade deve ser o fluxo global de auth.

6. Corrigir logout
- Integrar `logOutRevenueCat()` no `signOut` de `useAuth`.
- Isso garante volta ao estado anônimo e evita “grudar” assinatura no usuário anterior.

7. Reescrever o `revenuecat-webhook` como fallback real
- Quando `app_user_id` for UUID válido:
  - atualizar/criar `subscribers`.
- Quando for `$RCAnonymousID:...`:
  - criar/atualizar registro órfão em `subscribers` com email técnico único, por exemplo `anonymous+<transaction_id>@revenuecat.local`.
- Gravar `transaction_id`, expiração e status para permitir o claim posterior no login.
- Não depender de `auth.admin.getUserById` para salvar o evento anônimo.

8. Melhorar `check-subscription`
- Além de buscar por `user_id`, adicionar fallback por `email`.
- Se encontrar registro órfão claimável já associado por email/claim recente, devolver status correto.
- Continuar expirando assinatura quando `subscription_end < now()`.

Arquivos envolvidos
- `src/main.tsx`
- `src/hooks/useAuth.tsx`
- `src/lib/revenuecat.ts`
- `src/components/AuthCard.tsx`
- `src/components/AppleSignInButton.tsx`
- `supabase/functions/revenuecat-webhook/index.ts`
- `supabase/functions/check-subscription/index.ts`
- nova migration em `supabase/migrations/...`

Resultado esperado
- Compra anônima no sandbox passa a ser preservada.
- Login Apple faz o `identifyUser` no momento certo.
- O registro em `subscribers` passa a aparecer mesmo se houver atraso de sandbox, porque haverá:
  - retry client-side;
  - `restorePurchases()` fallback;
  - claim de órfão;
  - webhook guardando o evento anônimo.

Fluxo alvo
```text
App start
  -> RevenueCat configure (iOS nativo)

Compra sem login
  -> RevenueCat usa $RCAnonymousID
  -> webhook cria registro órfão

Login Apple / auth change
  -> identifyUser(user.id)
  -> RevenueCat transfere compra para UUID real
  -> syncSubscriptionAfterLogin()
     -> retry entitlement
     -> restore fallback
     -> claim órfão
     -> update/insert subscribers

Logout
  -> Purchases.logOut()
```

Ponto técnico mais importante
- Antes de qualquer ajuste de lógica, precisa corrigir o constraint da tabela `subscribers`, porque o valor `apple`/`revenuecat` hoje está incompatível com a regra atual do banco. Sem isso, mesmo a lógica certa pode continuar falhando.
