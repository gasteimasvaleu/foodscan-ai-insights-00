

## Adequar header da página Jejum ao padrão das outras páginas

### Problema
O header atual da página `/jejum` usa um banner full-width simples (`div` com `bg-gradient-to-r` sem rounded, sem backdrop-blur, sem border). As outras páginas (Hydration, FitTracker, Treinos, etc.) usam um card arredondado com ícone dentro de um box gradiente.

### Alteração
**Editar**: `src/pages/IntermittentFasting.tsx` (linhas 197-203)

Substituir o header atual por o padrão usado nas outras páginas — um card arredondado dentro do container, com o ícone `Timer` dentro de um box gradiente:

```tsx
{/* Header */}
<div className="mb-6 animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <Timer className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-lg font-bold text-foreground">Jejum Intermitente</h1>
  </div>
</div>
```

Mover este bloco para dentro do `<div className="container mx-auto px-4 py-8 space-y-4">` como primeiro filho, em vez de ficar fora do container.

