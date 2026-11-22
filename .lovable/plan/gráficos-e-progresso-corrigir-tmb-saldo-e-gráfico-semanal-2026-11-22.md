# Gráficos e Progresso: corrigir TMB, saldo e gráfico semanal

## O que está errado (conferido na sua conta)
- **TMB 0 kcal:** a sua TMB nunca foi salva, então ela fica 0. Com isso, o "Total Gasto" fica bem menor do que o real.
- **"Superávit" com saldo 0:** a tela chama qualquer saldo que não seja negativo de "Superávit", inclusive o zero.
- **Gráfico até 24.000:** a linha da meta é a meta diária vezes 7 (3.386 × 7 ≈ 23.700). Mas os pontos de calorias são registros soltos de dias antigos (março, abril e outubro), e não a soma das semanas. Por isso o gráfico mostra uma meta enorme ao lado de valores pequenos e datas que não são as mais recentes.

## O que muda
1. **TMB**
   - Se a TMB estiver em 0, aparece o aviso "Defina sua TMB" com o botão da calculadora em destaque.
   - A calculadora já abre preenchida com o peso, a altura e a idade que o app já conhece (da Avaliação Física e do FitTracker). Você só escolhe o sexo e toca em "Usar este valor".
2. **Saldo**
   - Saldo negativo mostra "Déficit", positivo mostra "Superávit" e zero mostra "Equilibrado".
   - Enquanto a TMB estiver em 0, o saldo mostra "Defina sua TMB para ver o saldo real", em vez de um rótulo enganoso.
3. **Gráfico de Progresso**
   - Mostra as 4 semanas mais recentes (segunda a domingo), calculadas a partir das refeições e bebidas registradas.
   - Cada ponto é a **média de calorias por dia** naquela semana, comparada com a meta diária (3.386 kcal). Assim, o gráfico fica numa escala de alguns milhares, que dá para ler.
   - As semanas aparecem com a data (ex.: "17/11") em vez de "Sem 1".

## Detalhes técnicos
- `src/pages/ChartsProgress.tsx`:
  - `loadWeeklyData`: parar de usar `weekly_summaries`. Buscar `meal_records` e `hydration_records` dos últimos 28 dias, agrupar por semana (começando na segunda), dividir pelos 7 dias e usar `goal = daily_goals.calories`.
  - Calculadora de TMB: ao montar, pré-preencher `bmrForm` com o peso e a altura de `physical_assessments` e a idade de `exercise_records`.
  - Rótulo do saldo: `< 0` Déficit, `> 0` Superávit, `= 0` Equilibrado. Se `editBMR === 0`, mostrar o aviso.
- Sem mudança no banco. No iPhone, a mudança chega por um Live Update.
