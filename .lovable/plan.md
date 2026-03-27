

## Adicionar botão de deletar refeição no Resumo Semanal

### Mudança

**`src/components/WeeklySummary.tsx`**:

1. Importar `Trash2` do lucide-react
2. Criar função `handleDeleteMeal(mealId)` que:
   - Deleta o registro da tabela `meal_records` no Supabase
   - Recarrega as refeições do dia (`loadDayMeals`) e os dados semanais (`loadWeeklyData`)
   - Exibe toast de sucesso/erro
3. Adicionar botão com ícone `Trash2` no canto superior direito de cada card de refeição (ao lado do badge de horário)
   - Estilo: botão ghost pequeno, cor vermelha no hover
   - Confirmação implícita pelo clique (ou um confirm() simples para evitar exclusões acidentais)

