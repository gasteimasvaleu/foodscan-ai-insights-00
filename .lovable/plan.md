

## Diagnóstico: Bug no fluxo de inicialização do RevenueCat

### Problema encontrado

No `useRevenueCat.ts` (linha 30-32), a inicialização do RevenueCat **só acontece quando existe um `user?.id`**:

```text
useEffect(() => {
  if (!isNative || !isIOS || !user?.id) return;  // ← BLOQUEIO
  initRevenueCat();
}, [isNative, isIOS, user?.id]);
```

Na tela de login (`AuthCard.tsx`), o usuário **ainda não está logado**, então `user` é `null`. Consequências:

1. `Purchases.configure()` nunca é chamado
2. `purchaseMonthly()` tenta usar o SDK sem configurar — pode funcionar se houver cache de sessão anterior, mas é instável
3. Após compra bem-sucedida, `hasPurchased = true` fica apenas em memória. Se o componente re-renderizar, `checkExistingSubscription()` nunca roda (precisa de configure), e `hasPurchased` volta para `false`, **desabilitando o botão Apple Sign In novamente**

### Plano de correção

**`src/hooks/useRevenueCat.ts`**:
- Remover a dependência de `user?.id` para inicializar o RevenueCat no iOS nativo
- Chamar `Purchases.configure()` com `appUserID` anônimo (passando `undefined` ou `null`) quando não houver usuário
- Quando houver `user?.id`, chamar `Purchases.logIn(user.id)` para associar o ID do Supabase
- Garantir que `purchaseMonthly()` e `restorePurchases()` chamem `configure` se ainda não inicializado
- Manter `syncToSupabase` condicionado ao `user?.id` (só sincroniza quando logado)

### Resultado esperado

```text
App abre (sem login) → RevenueCat configura anônimo → preço carrega
→ Usuário compra → hasPurchased = true (persiste via SDK)
→ Botão Apple Sign In habilitado → Login funciona
→ Purchases.logIn(userId) associa a compra ao usuário
```

### Arquivo editado
| Arquivo | Mudança |
|---|---|
| `src/hooks/useRevenueCat.ts` | Inicializar RevenueCat sem depender de user, usar login após autenticação |

