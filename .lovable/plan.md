

## Mostrar refeições do dia selecionado no Resumo Semanal

Ao selecionar um dia da semana no Resumo Semanal, exibir a lista de refeições consumidas naquele dia logo abaixo do card de totais nutricionais.

### Mudanças

**`src/components/WeeklySummary.tsx`**:

1. Adicionar estado `dayMeals` para armazenar as refeições do dia selecionado
2. Criar função `loadDayMeals(dayIndex)` que busca `meal_records` do Supabase filtrando por `user_id` e data correspondente ao dia da semana
3. Chamar `loadDayMeals` sempre que `selectedDay` mudar (via `useEffect`)
4. Renderizar lista de refeições abaixo do card de totais do dia selecionado:
   - Cada refeição mostra: nome do alimento, horário, porção e macros (calorias, carbs, proteínas, gorduras)
   - Estilo consistente com o app: cards em `bg-gray-50 rounded-2xl`, valores em `text-[#FD46A1]`
   - Se não houver refeições, mostrar mensagem "Nenhuma refeição registrada"
   - Ícone de relógio + horário como badge (similar ao `MealsList`)

### Detalhes técnicos
- Query: `supabase.from('meal_records').select('*').eq('user_id', user.id).gte('meal_time', startOfDay).lt('meal_time', endOfDay).order('meal_time')`
- Reutilizar o tipo `MealRecord` já existente importando de `DailyControl` ou definindo localmente
- A lista aparece apenas quando `selectedDayData` existe (dia tem dados)

