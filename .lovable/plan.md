
Objetivo
- Incluir calorias das bebidas em todos os cards pedidos.
- Como você confirmou “Carboidratos: Considerar sempre”, incluir também carboidratos estimados das bebidas em todos os resumos de carboidrato.

Decisão funcional (carboidratos)
- Não deixar carboidratos “de fora”.
- Adotar cálculo por estimativa nutricional por bebida (g/100ml) no catálogo, igual já feito com kcal/100ml.
- Calcular carboidrato da bebida por registro: `carbs = (volume_ml / 100) * carbsPer100ml`.
- Exibir somente totais combinados (refeições + bebidas), sem destacar origem.

Arquivos e mudanças

1) `src/data/hydrationCatalog.ts`
- Adicionar campo `defaultCarbohydratesPer100ml` no tipo `HydrationBeverage`.
- Preencher estimativas para todas as bebidas (inclusive já existentes).
- Manter fórmula de hidratação e calorias atuais intactas.

2) `src/pages/DailyControl.tsx`
- Buscar também `hydration_records` do dia atual junto com `meal_records`.
- Calcular `beveragesTotals` (calorias + carboidratos) a partir de `beverage_key`, `volume_ml` e catálogo.
- Combinar totais de refeições + bebidas para:
  - Card “Metas Diárias” (via props para `DailyGoals`).
  - Payload de “Encerrar Dia” (`consumed.calories` e `consumed.carbohydrates`).
  - `saveWeeklySummary` (salvar total combinado do dia).

3) `src/components/DailyGoals.tsx`
- Ajustar props para receber totais extras de bebidas (ou total já combinado).
- Somar calorias e carboidratos de bebidas no cálculo exibido dos progressos.
- Proteínas e gorduras de bebidas permanecem 0 quando não houver dado.

4) `src/components/WeeklySummary.tsx`
- Refatorar agregação semanal para usar refeições + hidratação no mesmo intervalo.
- Atualizar:
  - Card do dia selecionado (kcal e carboidratos combinados).
  - Card “Médias da Semana” (kcal/dia e carb/dia combinados).
- Manter listagem detalhada de refeições como está (sem criar seção extra de bebidas), já que você pediu só computar no total.

5) `src/pages/ChartsProgress.tsx`
- `loadCalorieBalance`: somar calorias de `hydration_records` ao lado “consumed” do gráfico.
- Card “Calorias” em “Estatísticas Gerais”:
  - trocar para total consumido (refeições + bebidas), para refletir exatamente o pedido.
  - manter demais cards (Refeições, Exercícios, Dias Ativos) sem regressão.

Critérios de validação (mobile 390x640)
- `/controle-diario`:
  - Card “Metas Diárias” aumenta kcal/carb ao registrar bebida.
  - “Encerrar Dia” grava resumo semanal com total combinado.
- `/graficos-progresso`:
  - Card “Calorias” inclui bebidas.
  - Gráfico “Balanço Calórico” mostra “Consumidas” com refeições + bebidas.
- “Resumo Semanal”:
  - Card do dia e “Médias da Semana” incluem bebidas em kcal e carboidratos.
- Sem alterar layout aprovado dos modais/hidratação.
