## Diagnóstico
O card `DailyAssessmentSummaryCard` usa gradiente `from-slate-900 via-slate-800 to-indigo-900` (azul escuro/preto) — destoa completamente do padrão dos outros cards do dashboard, que usam gradientes coloridos vibrantes alinhados ao branding (rosa nas calorias, azul nas águas, roxo no jejum).

Como o brand primary é `#FD46A1` e o card de calorias já usa rosa claro (`pink-100 → pink-200`), o card de avaliação física pode adotar um gradiente magenta/rosa mais saturado, na mesma família mas distinto, mantendo coesão visual.

## Mudanças em `src/components/DailyAssessmentSummaryCard.tsx`

### 1. Substituir o gradiente de fundo (3 ocorrências — linhas 95, 119, 157)
De:
```
bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900
```
Para:
```
bg-gradient-to-br from-[#FD46A1] via-[#FF6FB3] to-[#FF9DCB]
```
(Magenta brand → rosa médio → rosa claro — coerente com `#FD46A1`.)

### 2. Ajustar as cores de delta de peso (linhas 184-195)
As cores `emerald-300` e `rose-300` ficam ok no novo fundo rosa, mas para reforçar legibilidade vou trocar `text-white/70` (estável) por `text-white/85` e manter o resto. Sem alteração estrutural.

### 3. Ajustar o `bmiClass` (linhas 18-23) para chips legíveis em fundo rosa
Os chips atuais usam tons translúcidos pastéis (sky/emerald/amber/rose 400 com 20% opacidade) que ficavam bem em fundo escuro mas perdem contraste em rosa. Trocar para chips com fundo branco translúcido + texto colorido sólido:
```
Abaixo:    bg-white/85 text-sky-600
Normal:    bg-white/85 text-emerald-600
Sobrepeso: bg-white/85 text-amber-600
Obesidade: bg-white/85 text-rose-600
```

### 4. Ajustar elementos auxiliares para o novo fundo
- Anel BG (linha 209): `stroke="rgba(255,255,255,0.15)"` → manter (fica bom em rosa também).
- Texto "BG" (linha 220): `text-white/60` → manter.
- Botão de ação (linhas 134, 245): `bg-white/15 hover:bg-white/25` → trocar para `bg-white/25 hover:bg-white/40` para garantir contraste no rosa mais claro.
- Badge "hoje/ontem" (linha 165): `bg-white/10` → `bg-white/20`.
- Empty state ícone (linha 126): `text-white/70` → manter.

## Fora do escopo
- Sem mudança de layout, hierarquia ou tipografia.
- Sem mudança no Dialog de registrar peso (já está padrão glass branco).
- Sem mudança nos outros cards do dashboard.
