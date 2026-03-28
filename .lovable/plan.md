

## Diagnóstico: Login com Apple falha após assinatura

### Problema identificado

No `AppleSignInButton.tsx`, o bloco `catch` (linha 63-71) captura **qualquer** erro mas descarta a mensagem real, mostrando apenas o genérico "Não foi possível fazer login com Apple." Isso impede o diagnóstico.

As causas mais prováveis são:

1. **Provider Apple não configurado no Supabase** — `signInWithIdToken({ provider: 'apple', token })` exige que o provider Apple esteja habilitado no dashboard Supabase (Authentication > Providers > Apple) com o Bundle ID correto (`app.dietainteligente`)
2. **Erro no token** — o identity token do sandbox pode ter um formato inesperado

### Plano de correção

**`src/components/AppleSignInButton.tsx`** — melhorar o tratamento de erro para expor a causa real:

- No bloco `catch`, logar `err` completo no console e incluir `err.message` no toast
- No bloco do `signInWithIdToken` error (linha 29), logar também o token parcial para debug (primeiros 20 chars)
- Adicionar log após `NativeAppleSignIn.authorize()` para confirmar que o plugin retornou com sucesso

### Verificação manual necessária

- Confirmar no dashboard Supabase (Authentication > Providers > Apple) que o provider está habilitado com:
  - **Bundle ID**: `app.dietainteligente`
  - **Service ID** e **Key ID** corretos (do Apple Developer)
  - **Private Key** (arquivo .p8) configurado

Sem essa configuração, `signInWithIdToken` sempre falhará.

### Arquivo editado
| Arquivo | Mudança |
|---|---|
| `src/components/AppleSignInButton.tsx` | Logs detalhados + mensagem de erro real no toast |

