## Modernizar card "Histórico Semanal" — `/apple-health`

No screenshot as barras não aparecem (só os números e as letras dos dias). Em vez de tentar consertar as barras manuais (divs com `h-20` que estão colapsando), vamos substituir tudo por um **gráfico Recharts moderno**, com passos e calorias num único visual comparativo.

### Mudança em `src/pages/AppleHealth.tsx` (linhas ~366–415)

Substituir o bloco atual por um único gráfico composto:

- **ComposedChart (Recharts)** com altura fixa `h-56` (≈220px) — garante render confiável.
- **Barras de Passos** em azul `#60A5FA` com gradiente vertical (`#60A5FA → #3B82F6`), cantos arredondados `radius={[8,8,0,0]}`.
- **Linha de Calorias** em laranja `#FB923C`, suavizada (`type="monotone"`), com pontos (`dot`) destacados, sobreposta às barras.
- **Eixo X**: dias da semana (S T Q Q S S D), fonte 10px, sem linha de eixo.
- **Eixo Y duplo discreto**: esquerda = passos, direita = kcal, fonte 9px, `tickLine={false}`, `axisLine={false}`.
- **Grid horizontal leve**: `strokeDasharray="3 3"`, cor `hsl(var(--border))`.
- **Tooltip customizado** glassmorphism (`bg-white/80 backdrop-blur-md`, `rounded-xl`, sombra) mostrando: dia + "Passos: X" + "kcal: Y".

### Header do card

Substituir os dois títulos (`Passos` / `Calorias`) por:

- Título "Histórico Semanal" (mantém).
- **Linha de legenda** com bolinha azul "Passos" + bolinha laranja "Calorias".
- **Pílulas de totais da semana** logo abaixo:
  - `Footprints` + `32.4k` (soma dos passos).
  - `Flame` + `1.230 kcal` (soma das calorias).

### Layout final

```text
┌──────────────────────────────────────────┐
│ Histórico Semanal                        │
│ ● Passos    ● Calorias                   │
│ [👟 32.4k]  [🔥 1.230 kcal]              │
│                                          │
│   ▆       ▆                              │
│   ▆   ▆   ▆   ▆        ▆  ← passos      │
│   ━━╱━╲━━━╲━━━╱━━━━━━     ← calorias    │
│   S   T   Q   Q   S   S   D              │
└──────────────────────────────────────────┘
```

### Detalhes técnicos

- Importar de `recharts`: `ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, defs, linearGradient`.
- Mapear `weeklyData` para `[{ day, steps, calories }]` com `toLocaleDateString('pt-BR', { weekday: 'narrow' })`.
- Sem alterações em hooks, dados, ou lógica de fetch — apenas presentação.
- Nenhum outro arquivo precisa ser modificado.