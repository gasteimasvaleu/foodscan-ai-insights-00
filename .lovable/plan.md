## Ajuste no card Apple Health (`src/components/HeroDeckRow.tsx`)

O número de passos está encostando no anel porque, no SVG `viewBox="0 0 100 100"`, o raio é 42 com `strokeWidth=10` — sobra pouco espaço interno para o texto `text-xl`.

### Mudanças no SVG do anel (linhas ~88–110)

- Aumentar o raio: `r=42` → `r=45`.
- Reduzir a espessura do anel para liberar mais espaço interno: `strokeWidth=10` → `strokeWidth=7` (nas duas circles, fundo e progresso).
- Recalcular `circ = 2 * Math.PI * 45` (já é dinâmico — só trocar a constante `radius`).
- Manter `strokeLinecap="round"` e a transição.

### Resultado

Anel ligeiramente maior e mais fino, criando uma "rosquinha" com mais área central. O número de passos (`text-xl`) e o ícone `Footprints` ficam confortáveis dentro, sem encostar na borda do gráfico.
