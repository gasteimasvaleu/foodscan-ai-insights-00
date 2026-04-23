

## Trocar cor do card de Avaliação Física

O gradiente atual (violet → purple → fuchsia) está visualmente muito próximo do card de Jejum Intermitente. Vou trocar para um gradiente **teal → emerald → cyan** (verde-azulado), que é distinto dos demais cards do carrossel:

- Calorias: laranja/vermelho
- Hidratação: azul
- Jejum: roxo/violeta
- **Avaliação Física (novo): teal/emerald/cyan**

### Mudança
Em `src/components/DailyAssessmentSummaryCard.tsx`, substituir nos 2 lugares (loading + card principal):

`from-violet-500 via-purple-500 to-fuchsia-500` → `from-teal-500 via-emerald-500 to-cyan-500`

Os textos brancos, anel SVG e badges seguem com bom contraste sobre o novo gradiente — sem outros ajustes.

### Arquivo afetado
- `src/components/DailyAssessmentSummaryCard.tsx`

### Fora do escopo
- Mudar gradientes dos outros cards do carrossel.

