

## Corrigir fluxo de login iOS + PaywallScreen

### Problemas identificados

1. **PaywallScreen aparece antes do login** — o card com "Assinar via App Store" é exibido diretamente, mas o correto é primeiro mostrar a tela de login (Apple Sign In + email/senha)
2. **Menu inferior (TubelightNavbar) aparece no paywall** — o `AuthAwareNavbar` em `App.tsx` mostra a navbar quando `user` existe, mas no paywall o user já está logado
3. **Card do paywall não está centralizado verticalmente**

### Fluxo correto

```text
Tela de Login (Apple Sign In + email/senha) → Login
  → Verifica assinatura
    → Sem assinatura → PaywallScreen (SEM navbar inferior)
    → Com assinatura → App normal (COM navbar)
```

### Alterações

**1. `src/pages/Index.tsx`**
- Quando `showPaywall` for true, retornar `<PaywallScreen>` SEM o `<Navbar />` e SEM renderizar nada mais (já faz isso, está correto)
- O problema real é o `AuthAwareNavbar` no `App.tsx`

**2. `src/App.tsx` — Esconder TubelightNavbar no paywall**
- O `AuthAwareNavbar` precisa também verificar se o usuário tem assinatura ativa em iOS nativo. Duas opções:
  - Opção A: Passar um estado global/context indicando "paywall ativo"
  - Opção B (mais simples): No `AuthAwareNavbar`, verificar `isNativeIOS && !subscribed` e retornar null
- Implementar opção B: adicionar `useNativePlatform` e `useAuth` (subscription) no `AuthAwareNavbar`, retornar null se `isNativeIOS && !subscription.subscriptionStatus.subscribed && !subscription.loading`

**3. `src/components/PaywallScreen.tsx` — Centralização vertical**
- O container já tem `min-h-screen flex items-center justify-center`, mas a screenshot mostra que não centraliza. Ajustar para garantir centralização real: remover `pt-[calc(env(safe-area-inset-top)+1rem)]` e usar padding uniforme com safe area em todos os lados

**4. `src/components/AuthCard.tsx` — Tela de login iOS já está correta**
- Verificar: o fluxo nativo iOS (linhas 168-230) já mostra Apple Sign In + email/senha + Restaurar Compras + textos legais, sem botão de compra. Isso está correto conforme o screenshot de referência (Mandato Intelligence).

### Resumo técnico

| Arquivo | O que muda |
|---|---|
| `src/App.tsx` | `AuthAwareNavbar` retorna null quando paywall está ativo (iOS nativo sem assinatura) |
| `src/components/PaywallScreen.tsx` | Corrigir centralização vertical do card |

Nenhuma mudança no `AuthCard.tsx` (já está correto) nem no `Index.tsx` (já renderiza PaywallScreen sem Navbar de topo).

