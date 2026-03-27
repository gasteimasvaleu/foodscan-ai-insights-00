

## Padronizar header da página Ficha de Treino

### Mudança

**`src/pages/WorkoutPlan.tsx` (linhas 177-185)** — Substituir o header centralizado pelo padrão glassmorphism. Adicionar import de `Dumbbell` do lucide-react.

De:
```tsx
<div className="flex flex-col items-center gap-4">
  <div className="text-center">
    <h1 className="text-3xl font-bold">Ficha de Treino</h1>
    <p className="text-muted-foreground">Monte seu treino semanal</p>
  </div>
  <Button className="w-full" onClick={() => navigate("/profile")}>
    Voltar
  </Button>
</div>
```

Para:
```tsx
<div className="flex flex-col gap-4">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <Dumbbell className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-xl font-bold text-[#FD46A1]">Ficha de Treino</h1>
  </div>
  <Button className="w-full" onClick={() => navigate("/profile")}>
    Voltar
  </Button>
</div>
```

