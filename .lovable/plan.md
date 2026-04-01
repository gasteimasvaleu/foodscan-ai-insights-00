

## Corrigir rota do card de jejum no carrossel

### Problema
O `DailyFastingSummaryCard` navega para `/intermittent-fasting`, mas a rota definida no `App.tsx` é `/jejum`.

### Alteração
**Editar**: `src/components/DailyFastingSummaryCard.tsx` — linha 84

Trocar `navigate('/intermittent-fasting')` por `navigate('/jejum')`.

