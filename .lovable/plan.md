

## Correções para aprovação na App Store (Build 5)

Baseado no screenshot de referência do seu outro app (BíbliaToon), entendi o padrão: o botão Apple fica desabilitado com texto explicativo, e o botão de assinar fica embaixo. O problema não é o fluxo em si — é que o IAP não funcionou no sandbox e a Apple quer uma opção de deletar conta.

### 1. Melhorar UX do botão Apple desabilitado (Guideline 2.1a)

O botão já está desabilitado, mas falta uma mensagem clara como no seu outro app. Vou adicionar um texto abaixo do botão Apple: "Assine primeiro abaixo para habilitar o login com Apple" — igual ao screenshot de referência. Assim o revisor entende que é intencional.

**Arquivo**: `src/components/AuthCard.tsx`
- Adicionar texto explicativo abaixo do `<AppleSignInButton disabled={!hasPurchased} />`

### 2. Corrigir IAP não funcionando no sandbox (Guideline 2.1b)

O botão de compra provavelmente falhou silenciosamente. Vou adicionar:
- Toast de erro visível quando a compra falha (não só console.error)
- Toast de erro quando o RevenueCat não inicializa
- Feedback visual se as offerings não carregaram

**Arquivos**:
- `src/hooks/useRevenueCat.ts` — adicionar toasts de erro na inicialização e na compra
- `src/components/AuthCard.tsx` — mostrar estado de erro quando offerings não carregam

### 3. Adicionar exclusão de conta (Guideline 5.1.1v)

Adicionar botão "Excluir Minha Conta" na seção Configurações do Profile, com AlertDialog de confirmação. A exclusão será feita via uma nova edge function.

**Arquivos**:
- `src/pages/Profile.tsx` — adicionar botão e AlertDialog de exclusão entre "Sair da Conta" e o final do card de Configurações
- `supabase/functions/delete-account/index.ts` — nova edge function que valida o JWT, deleta dados do usuário das tabelas relacionadas, e deleta o usuário via `supabase.auth.admin.deleteUser()`

### Resumo

| Problema Apple | Solução |
|---|---|
| Apple Sign In sem ação | Manter desabilitado + adicionar texto explicativo claro |
| IAP sem ação | Adicionar toasts de erro + feedback visual |
| Sem exclusão de conta | Botão no Profile + edge function |

