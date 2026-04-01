

## Ajustar ordem dos dias da semana — começar pelo domingo

### Alteração
**Editar**: `src/pages/IntermittentFasting.tsx`

Na construção do array `weekDays` (linhas ~153-170), reordenar para que o domingo seja sempre o primeiro elemento da esquerda. Atualmente os dias são gerados como "últimos 7 dias" em ordem cronológica. A lógica será ajustada para encontrar o domingo mais recente e gerar os 7 dias a partir dele (domingo a sábado), mantendo a mesma lógica de busca de registros.

