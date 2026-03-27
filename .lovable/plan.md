

## Reformular pagina /auth para cadastro VIP via token

### Alteracoes em `src/pages/Auth.tsx`

1. **Remover tabs e aba de login** - Pagina exclusivamente de cadastro
2. **Detectar `?token=` na URL** via `useSearchParams`
3. **Mensagem VIP** quando token presente: icone Crown, titulo "Voce recebeu um Acesso VIP!", subtitulo sobre acesso exclusivo ao We Diet
4. **Formulario de cadastro** (Nome, Email, Senha) - sem login, sem Apple Sign In
5. **Apos cadastro com sucesso**:
   - Toast "Cadastro realizado com sucesso!"
   - NAO redirecionar
   - Substituir formulario por tela de sucesso com instrucoes para baixar o app e botao App Store (link placeholder por enquanto)
6. **Remover** imports nao usados (Tabs, signIn, AppleSignInButton)

### Fluxo visual

```text
ANTES DO CADASTRO:
┌──────────────────────────────┐
│     👑 Acesso VIP!           │
│  Voce foi selecionado(a)     │
│  para acesso exclusivo       │
│                              │
│  [Nome]                      │
│  [Email]                     │
│  [Senha]                     │
│  [Cadastrar]                 │
└──────────────────────────────┘

APOS CADASTRO:
┌──────────────────────────────┐
│  ✅ Cadastro realizado!      │
│                              │
│  Agora baixe o app para      │
│  comecar sua jornada:        │
│                              │
│  [ Baixar na App Store ]     │
└──────────────────────────────┘
```

### Detalhes tecnicos
- `useSearchParams` para detectar token
- Estado `registered` (boolean) alterna entre formulario e tela de sucesso
- Botao App Store so aparece apos cadastro, com `window.open(appStoreUrl, '_blank')` - URL placeholder
- Remover `useEffect` que redireciona usuario logado

