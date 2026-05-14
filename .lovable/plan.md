## Refinar visual dos cards de avaliação física

Arquivo: `src/pages/PhysicalAssessment.tsx`. Sem alterar tamanhos de fonte.

### 1. Cards com identidade rosa (We Diet)
- Trocar `bg-card/80 backdrop-blur-sm border-border/50 shadow-xl` por:
  `bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)]`
- Adicionar uma faixa rosa fina à esquerda como acento: `before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]` em um wrapper `relative overflow-hidden`.
- Aplicar mesmo tratamento ao card "Nenhuma avaliação registrada".

### 2. Métricas em uma única linha horizontal (sem wrap)
Substituir o `flex flex-wrap` por uma faixa de 3 colunas igualmente distribuídas:

```text
┌──────────┬──────────┬──────────┐
│  70 kg   │   20%    │  55 kg   │
│   Peso   │ Gordura  │  Magra   │
└──────────┴──────────┴──────────┘
```

- Container: `grid grid-cols-3 gap-2 mt-3`
- Cada célula: `bg-[#FFD1E7]/40 rounded-xl px-2 py-2 text-center`
- Valor (linha 1): `text-sm font-semibold text-foreground tabular-nums leading-tight` (mantém `text-sm`)
- Label (linha 2): `text-[10px] text-muted-foreground uppercase tracking-wide leading-tight`
- Em vez de ocultar, métrica ausente vira `—` para preservar o alinhamento horizontal.
- `tabular-nums` mantém os números alinhados visualmente.

### 3. Header mais limpo
- Manter data compacta `dd MMM yyyy` e o chip de delta de peso (`↓ 0,5 kg desde 06 mai`) em `text-xs` com cores semânticas (verde/vermelho/cinza).
- Botões editar/excluir em `flex gap-1 shrink-0`, `variant="ghost" size="icon"` com `text-[#FD46A1]/70 hover:text-[#FD46A1] hover:bg-[#FFD1E7]/40`.
- Layout do `CardHeader`: `flex items-start justify-between gap-3 pb-2`.

### Resultado

```text
│ 13 mai 2026                      [✎] [🗑]
│ ↓ 0,5 kg desde 06 mai
│ ┌────────┬────────┬────────┐
│ │ 70 kg  │  20%   │ 55 kg  │
│ │  PESO  │GORDURA │ MAGRA  │
│ └────────┴────────┴────────┘
```

Faixa rosa vertical à esquerda, borda rosa suave ao redor, métricas alinhadas em grid de 3 colunas iguais que cabem confortavelmente em 390px.

Sem mudanças em dados, schema ou outros componentes.
