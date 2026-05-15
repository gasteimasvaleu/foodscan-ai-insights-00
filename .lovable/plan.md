## Objetivo
Aumentar o tamanho do disco circular de % de gordura corporal (BG) no card de Avaliação Física do dashboard, deixando-o mais legível no mobile real.

## Arquivo
`src/components/DailyAssessmentSummaryCard.tsx`

## Mudanças
- Aumentar o SVG de 64×64 para ~84×84 (raio de 28 → 36, stroke de 5 → 6).
- Ajustar o container `w-[64px] h-[64px]` para `w-[84px] h-[84px]`.
- Aumentar a tipografia interna: número `text-sm` → `text-base`, label "BG" mantida em `text-[8px]` (ou `text-[9px]`).
- Recalcular `circumference` para o novo raio (já é dinâmico, basta trocar a constante).
- Manter o grid de 3 colunas e o alinhamento central — peso e IMC permanecem iguais.

Sem alterações em lógica, dados ou outros cards.