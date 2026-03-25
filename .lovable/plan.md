

## Fix: Menu lateral "Meu Perfil" ocupa toda a altura

O SheetContent usa `h-full` e ocupa 100% da tela. Precisa de margem superior/inferior e borda rosa igual aos modais.

### Alteracao

**`src/components/Navbar.tsx`** (linha 63):
- No `SheetContent`, trocar `h-full` por `h-[calc(100%-3rem)]` e adicionar `my-6 rounded-2xl border-2 border-primary`
- Isso adiciona espaco superior e inferior + borda rosa consistente com os modais

