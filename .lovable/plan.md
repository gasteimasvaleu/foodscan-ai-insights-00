

## Remover fluxo Hotmart, manter edge de envio de token via Resend

### Resumo

Remover toda a integração com Hotmart (webhook, referências no check-subscription, fluxo na Auth page), mas extrair a lógica de criação de token + envio de email via Resend para uma edge function independente (`send-registration-token`), que podera ser usada manualmente depois.

### Alteracoes

#### 1. Criar nova edge function `send-registration-token`
**`supabase/functions/send-registration-token/index.ts`**

Extrair do `hotmart-webhook` apenas a logica de:
- Receber `email`, `name`, `plan_type` (monthly/annual) via body JSON
- Criar registro em `registration_tokens` (sem `hotmart_transaction_id`)
- Enviar email via Resend com o template HTML existente
- Retornar o token criado

Requer autenticacao admin (verificar role ou service_role key).

#### 2. Deletar edge function Hotmart
**Deletar**: `supabase/functions/hotmart-webhook/index.ts`

#### 3. Deletar edge function activate-subscription
**Deletar**: `supabase/functions/activate-subscription/index.ts`

Nao sera mais necessaria sem o fluxo Hotmart de signup com token.

#### 4. Simplificar `check-subscription`
**`supabase/functions/check-subscription/index.ts`**

- Remover toda a logica de `is_hotmart_managed` (linhas 96-128)
- Remover checks de `payment_provider === 'hotmart'` (linhas 136-158, 192-209, 258-283, 286-320)
- Remover referencia a `hotmart_transaction_id` nos upserts
- Manter: protecao Apple, Stripe check, race condition protection

#### 5. Simplificar `Auth.tsx`
**`src/pages/Auth.tsx`**

- Remover estados: `isHotmartFlow`, `hotmartToken`, `tokenData`, `tokenError`, `validatingToken`
- Remover `validateHotmartToken` function
- Remover bloco condicional de ativacao Hotmart no `handleSignUp`
- Remover card condicional Hotmart no JSX (linhas 231-269)
- Remover condicional `!isHotmartFlow && !validatingToken` — mostrar o card de login sempre
- Manter: login/senha, cadastro manual, `AppleSignInButton`, login automatico apos signup manual

#### 6. Manter intactos
- `supabase/functions/validate-token/index.ts` — sera usado pela nova edge function
- `supabase/functions/revenuecat-webhook/index.ts`
- Tabela `registration_tokens` no banco

