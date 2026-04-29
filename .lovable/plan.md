## Problema

Na página `/receitas`, aba "Minhas receitas", o modal aberto pelo botão "Criar nova receita" ocupa toda a largura horizontal da tela no mobile, fora do padrão do app (que mantém margens laterais de 1rem com glassmorphism centralizado).

## Causa

Em `src/components/MyRecipesTab.tsx` linha 191, o `DialogContent` usa apenas `max-w-md`, sem `w-[calc(100%-2rem)] mx-auto`, então no mobile ele estica até as bordas.

## Correção

**Arquivo:** `src/components/MyRecipesTab.tsx` (linha 191)

Substituir as classes do `DialogContent` para:

```tsx
<DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl max-h-[90vh] overflow-y-auto">
```

Isso aplica o mesmo padrão usado no modal de `/alimentos` corrigido anteriormente: 1rem de margem lateral, centralizado, glassmorphism e shadow consistentes.
