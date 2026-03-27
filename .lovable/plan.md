

## Adicionar contexto automático de metas diárias no NutriCoach

### O que muda
O chat do NutriCoach passará a buscar as metas diárias do usuário (calorias, proteínas, carboidratos, gorduras, objetivo) do Supabase e enviá-las junto com as mensagens para a Edge Function, que as incluirá no system prompt.

### Mudanças

1. **`src/pages/NutriCoach.tsx`**
   - Importar `supabase` client
   - Adicionar `useEffect` para buscar `daily_goals` do usuário ao montar o componente
   - Passar o objeto `userContext` (metas + nome do perfil) no body do fetch para a Edge Function
   - Também buscar `profiles` para pegar o nome do usuário

2. **`supabase/functions/nutri-coach-chat/index.ts`**
   - Receber campo opcional `userContext` do body (`{ calories, proteins, carbohydrates, fats, diet_objective, name }`)
   - Quando presente, anexar ao system prompt um bloco com as informações do usuário:
     ```
     Contexto do usuário:
     - Nome: {name}
     - Objetivo: {diet_objective}
     - Meta calórica: {calories} kcal
     - Proteínas: {proteins}g | Carboidratos: {carbohydrates}g | Gorduras: {fats}g
     
     Use essas informações para personalizar suas respostas.
     ```

### Detalhes técnicos
- A query ao `daily_goals` usa `order('created_at', { ascending: false }).limit(1)` para pegar a meta mais recente
- O contexto é enviado uma vez no body e concatenado ao system prompt server-side — não ocupa tokens de histórico
- Se o usuário não tiver metas cadastradas, o chat funciona normalmente sem contexto extra

