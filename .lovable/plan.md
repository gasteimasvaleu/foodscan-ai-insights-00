

## Padronizar header da página Minhas Dietas

### Mudança

**`src/pages/MyDiets.tsx`**

1. Adicionar import de `UtensilsCrossed` do lucide-react (ícone adequado para dietas)

2. Substituir o header (linhas 162-170):

```tsx
// De:
<div className="flex flex-col items-center gap-4">
  <div className="text-center">
    <h1 className="text-3xl font-bold">Minhas Dietas</h1>
    <p className="text-muted-foreground">Monte sua dieta semanal</p>
  </div>
  <Button className="w-full" onClick={() => navigate("/profile")}>
    Voltar
  </Button>
</div>

// Para:
<div className="flex flex-col gap-4">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <UtensilsCrossed className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-xl font-bold text-[#FD46A1]">Minhas Dietas</h1>
  </div>
  <Button className="w-full" onClick={() => navigate("/profile")}>
    Voltar
  </Button>
</div>
```

