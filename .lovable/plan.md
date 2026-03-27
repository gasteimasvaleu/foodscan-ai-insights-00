

## Padronizar header da página Avaliação Física

### Mudança

**`src/pages/PhysicalAssessment.tsx` (linhas 183-187)** — Substituir o header atual pelo padrão glassmorphism usado nas outras páginas. Remover o subtítulo e usar o layout horizontal com ícone.

De:
```tsx
<div className="flex flex-col items-center gap-4">
  <div className="text-center">
    <h1 className="text-3xl font-bold">Avaliação Física</h1>
    <p className="text-muted-foreground">Acompanhe sua evolução</p>
  </div>
```

Para:
```tsx
<div className="flex flex-col gap-4">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <ClipboardList className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-xl font-bold text-[#FD46A1]">Avaliação Física</h1>
  </div>
```

Adicionar import de `ClipboardList` do lucide-react.

