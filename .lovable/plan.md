
Objetivo: eliminar a condição de corrida entre autenticação/assinatura para que no iOS o fluxo fique sempre: Login (com “Continuar com Apple”) → Paywall (se necessário) → App com Tubelight imediatamente após assinatura válida.

1) Diagnóstico consolidado (causa raiz)
- Há múltiplas instâncias de `useAuth()` rodando em paralelo (`App`, `Index`, `AuthCard`, `Navbar`), cada uma com estado próprio de `user/subscription`.
- `useSubscription` inicia com `subscribed=false` e `loading=false`; isso permite decisões de UI antes da primeira checagem real.
- Em `Index`, `onSubscribed` define `paywallDismissed=true` antes de confirmar assinatura no backend, abrindo o app sem menu em alguns casos.
- Logs da edge function mostram sessões inválidas em alguns momentos (“User from sub claim in JWT does not exist”), agravando o comportamento inconsistente.

2) Refatoração de estado global (principal correção)
- Criar um `AuthProvider` único (Context) para centralizar:
  - `user`, `session`, `authLoading/authReady`
  - `subscriptionStatus`, `subscriptionLoading`, `subscriptionReady`
  - ações `signIn/signOut/signUp/checkSubscription`
- Converter `useAuth` para consumir esse contexto (em vez de criar estado novo por componente).
- Envolver app inteiro com `AuthProvider` em `src/App.tsx`/`src/main.tsx`.

3) Gating correto de renderização (sem “flash” errado)
- Em `Index.tsx`, só decidir paywall quando `authReady === true`.
- Se usuário logado no iOS, só decidir paywall depois de `subscriptionReady === true`.
- Enquanto não estiver pronto, renderizar estado neutro de carregamento (sem paywall e sem trocar para tela errada).
- Resetar `paywallDismissed` ao trocar usuário/logout.

4) Ajuste do fluxo pós-compra (ponto crítico do bug)
- Alterar callback de `PaywallScreen` para:
  - primeiro revalidar assinatura (`await checkSubscription()`),
  - só então liberar entrada no app quando `subscribed=true`.
- Remover dependência de “dismiss” prematuro que hoje deixa app abrir sem Tubelight.

5) Recuperação de sessão inválida
- No bootstrap de auth, validar sessão restaurada; se token estiver inválido/usuário inexistente, forçar sign-out limpo e voltar ao card de login.
- Isso evita cair direto no paywall com sessão fantasma.

6) Arquivos alvo
- `src/hooks/useAuth.tsx` (ou split para provider/hook)
- `src/hooks/useSubscription.ts`
- `src/pages/Index.tsx`
- `src/App.tsx`
- (novo) `src/contexts/AuthProvider.tsx` (ou equivalente)

Detalhes técnicos
- Novo contrato recomendado:
  - `authReady`: sessão já restaurada e consistente.
  - `subscriptionReady`: assinatura já consultada para o usuário atual.
- Regras de UI:
  - `!user` => mostrar `AuthCard`.
  - `user && isNativeIOS && subscriptionReady && !subscribed` => `PaywallScreen`.
  - `user && (!isNativeIOS || subscribed)` => app + Tubelight.
- `checkSubscription()` deve retornar resultado para permitir decisão síncrona no callback de compra.

Plano de validação (E2E iOS)
1. App fechado → abrir: deve mostrar login (Apple visível) quando não autenticado.
2. Login Apple sem assinatura: paywall aparece só após login.
3. Assinar: entra no app com Tubelight imediatamente (sem precisar logout/login).
4. Logout → login novamente: comportamento idêntico, sem regressão.
5. Teste com sessão inválida: deve voltar ao login, nunca prender em paywall indevido.
