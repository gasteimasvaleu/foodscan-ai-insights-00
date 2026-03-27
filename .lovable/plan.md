

## Adicionar ícone quadrado com border-radius no card de título

### Problema
O card de título do NutriCoach está sem o ícone quadrado com gradiente e border-radius que existe nas outras páginas (ex: MasterCheFIT com `ChefHat`).

### Padrão existente (MasterCheFIT, linha 353-358)
```tsx
<div className="... flex items-center gap-3">
  <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
    <ChefHat className="w-6 h-6 text-white" />
  </div>
  <h1 className="text-xl font-bold text-primary">MasterCheFIT</h1>
</div>
```

### Alteração

**`src/pages/NutriCoach.tsx`** — linhas 210-211:

Adicionar `flex items-center gap-3` ao container e incluir o ícone quadrado com `MessageCircle` (já importado):

```tsx
<div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
  <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
    <MessageCircle className="w-6 h-6 text-white" />
  </div>
  <h1 className="text-xl font-bold text-primary">NutriCoach</h1>
</div>
```

