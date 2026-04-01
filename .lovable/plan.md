

## Ajustar ícone do header para o padrão das outras páginas

### Problema
O ícone `Timer` no header está solto, sem o box gradiente com border-radius que é usado nas outras páginas (Hydration, FitTracker, etc.).

### Alteração
**Editar**: `src/pages/IntermittentFasting.tsx` (linha ~200)

Envolver o ícone `Timer` em um `div` com o padrão de box gradiente:

```tsx
<div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
  <Timer className="w-6 h-6 text-white" />
</div>
```

Mudança: o ícone passa de `text-primary` para `text-white` já que ficará dentro do box colorido.

