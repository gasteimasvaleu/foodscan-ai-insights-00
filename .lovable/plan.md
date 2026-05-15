## Melhorar UX do botão "Meu Perfil" no Navbar

Arquivo: `src/components/Navbar.tsx` (linhas 55–68)

### Mudanças

Substituir o `<div>` + `<span>` + `<Button icon>` por um único `<button>` unificado como `SheetTrigger asChild`:

- **Alvo único e maior**: `min-w-[48px] min-h-[48px] p-2`, com `flex items-center gap-2`
- **Avatar circular com inicial**: substitui o ícone `User`. Círculo `w-8 h-8 rounded-full bg-white/20 border border-white/40` exibindo a primeira letra do `user.email` (ou `user.user_metadata?.name`) em uppercase, branco, `text-sm font-semibold`. Quando aberto, mostra `X` no lugar da inicial (mesmo container, transição suave)
- **Label**: mantém "MEU PERFIL" com `text-sm font-medium text-white/90`
- **Micro-interação**: `transition-all active:scale-95 hover:bg-white/10 rounded-xl` no botão inteiro
- **A11y**: `aria-label="Abrir menu do perfil"`

Sem mudanças de lógica, rotas, ou no conteúdo do `SheetContent`.

### Detalhes técnicos

```tsx
const initial = (user.user_metadata?.name || user.email || '?')
  .trim().charAt(0).toUpperCase();

<SheetTrigger asChild>
  <button
    aria-label="Abrir menu do perfil"
    className="flex items-center gap-2 min-w-[48px] min-h-[48px] p-2 rounded-xl
               text-white/90 hover:text-white hover:bg-white/10
               active:scale-95 transition-all duration-150"
  >
    <span className="text-sm font-medium">MEU PERFIL</span>
    <span className="relative w-8 h-8 rounded-full bg-white/20 border border-white/40
                     flex items-center justify-center text-sm font-semibold">
      {isOpen ? <X className="h-4 w-4" /> : initial}
    </span>
  </button>
</SheetTrigger>
```

Remove o import de `Button` (não mais usado) e mantém `User` removido se não usado em outro lugar (verificar: só é usado aqui).
