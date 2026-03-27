

## Padronizar header da página Receitas

O título atual usa um `<h1>` simples com emoji. O padrão das outras páginas usa um card com gradiente, ícone em círculo e título rosa.

### Mudança

**`src/pages/Receitas.tsx`** — Substituir o `<h1>` na linha 25 pelo header padrão:

```tsx
<div className="mb-6 animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <UtensilsCrossed className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-lg font-bold text-[#FD46A1]">Receitas</h1>
  </div>
</div>
```

Nenhuma outra mudança necessária — o ícone `UtensilsCrossed` já está importado.

