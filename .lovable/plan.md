

## Padronizar header da página Gráficos e Progresso + remover card de ação rápida

### Mudanças

**1. `src/pages/ChartsProgress.tsx`** — Substituir o header simples (linhas 240-243) pelo padrão das outras páginas:
```tsx
<div className="mb-6 animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <BarChart3 className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-xl font-bold text-[#FD46A1]">Gráficos e Progresso</h1>
  </div>
</div>
```
Adicionar import de `BarChart3` do lucide-react.

**2. `src/pages/Profile.tsx`** — Remover o card "Gráficos e Progresso" do grid de Ações Rápidas (o div com `onClick={() => navigate("/graficos-progresso")}`). Remover import de `BarChart3` se não for mais usado.

