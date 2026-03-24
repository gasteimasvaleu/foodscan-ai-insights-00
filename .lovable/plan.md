

## Padronizar header cards de todas as páginas com layout compacto em linha única

### Problema atual
Os header cards das páginas são grandes e verticais: ícone em cima, título embaixo, descrição embaixo. Ocupam muito espaço vertical, não parecem app nativo.

### Novo design
Layout horizontal compacto em uma linha: ícone SVG ao lado do título, tudo dentro de um card com a mesma cor/estilo do MasterCheFIT (`bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30`). Remove a descrição/subtítulo. Reduz padding e tamanho do ícone.

```text
┌─────────────────────────────────────┐
│  [icon]  Título da Página           │
└─────────────────────────────────────┘
```

### Páginas a alterar (8 páginas)

1. **MasterCheFIT.tsx** (linhas 348-365) - ChefHat + "MasterCheFIT"
2. **DailyControl.tsx** (linhas 331-351) - BarChart3 + "Controle Diário"
3. **Treinos.tsx** (linhas 153-173) - Dumbbell + "Central de Treinos"
4. **FoodScan.tsx** (linhas 593-613) - Scan + "FoodScan"
5. **FitTracker.tsx** (linhas 58-78) - Activity + "FitTracker"
6. **ServiNUTRI.tsx** (linhas 488-508) - Stethoscope + "ServiNUTRI"
7. **WhatsAppSettings.tsx** (linhas 40-59) - MessageCircle + "Configurações WhatsApp"
8. **About.tsx** (linhas 12-17) - Sem ícone atualmente, adicionar Info icon
9. **Subscription.tsx** (linhas 15-27) - Sem ícone atualmente, adicionar CreditCard icon

### Novo padrão de header (aplicado a todas)

Cada header será substituído por:

```tsx
<div className="mb-6 animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <IconComponent className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-xl font-bold text-white">Título</h1>
  </div>
</div>
```

Mudancas vs atual:
- `p-8` → `px-5 py-3` (padding compacto)
- `rounded-3xl` → `rounded-2xl`
- `mb-12` → `mb-6`
- Ícone: `p-6 w-12 h-12` → `p-2.5 w-6 h-6`
- Layout: vertical centralizado → `flex items-center gap-3` horizontal
- Remove subtítulo/descrição
- Remove blur/pulse no ícone
- Remove hover:scale no título

