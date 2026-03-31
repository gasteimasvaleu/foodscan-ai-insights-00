

## Corrigir fluxo VIP: ativar assinatura após cadastro com token

### Problema
O token do link VIP é apenas decorativo. Após o cadastro, nenhum registro é criado na tabela `subscribers`, então o usuário VIP cai na paywall ao abrir o app.

### Solução

**1. `src/pages/Auth.tsx` — Validar token e ativar assinatura após signup**

Após o signup + auto-login bem-sucedido, se houver `token` na URL:
- Chamar a edge function `validate-token` com o token
- Se válido, criar registro na tabela `subscribers` via uma **nova edge function** (o frontend não tem permissão de insert direto com service_role)
- Marcar token como usado

**2. Nova edge function `activate-vip-subscription`**

Recebe: `{ token: string }`  
Usa o JWT do usuário autenticado para identificar quem está ativando.

Lógica:
1. Validar token na tabela `registration_tokens` (válido, não usado, não expirado)
2. Criar registro em `subscribers` com:
   - `user_id` do usuário autenticado
   - `email` do usuário
   - `subscribed: true`
   - `subscription_tier` baseado no `plan_type` do token
   - `subscription_end` do token
   - `payment_provider: 'vip_token'`
3. Marcar `registration_tokens.is_used = true` e `used_by = user_id`
4. Retornar sucesso

**3. `src/pages/Auth.tsx` — Integrar chamada**

No `handleSignUp`, após auto-login:
```
if (token) {
  await supabase.functions.invoke('activate-vip-subscription', { body: { token } });
}
```

### Fluxo corrigido
1. Usuário acessa `/auth?token=xxx` → vê card VIP
2. Cadastra com email/senha → auto-login
3. Frontend chama `activate-vip-subscription` → cria registro em `subscribers`
4. Card "Cadastro realizado" + botão App Store
5. Usuário baixa app → login com email/senha → `check-subscription` encontra registro → **acesso liberado, sem paywall**

### Arquivos envolvidos
- **Novo:** `supabase/functions/activate-vip-subscription/index.ts`
- **Editar:** `src/pages/Auth.tsx` (adicionar chamada à nova function após signup com token)

