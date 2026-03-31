

## Modal de detalhes da refeição no RecentScans

### Arquivo: `src/components/RecentScans.tsx`

**Alterações:**
1. Expandir a query para buscar todos os campos nutricionais: `proteins`, `carbohydrates`, `fats`, `portion`, `meal_type`, `meal_time`
2. Adicionar state para controlar o modal e a refeição selecionada
3. Tornar cada card clicável com `cursor-pointer` e `onClick`
4. Adicionar um `Dialog` (seguindo o padrão glassmorphism do app: `w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`) exibindo:
   - Imagem grande da refeição (arredondada, aspect-ratio)
   - Nome do alimento
   - Porção e tipo de refeição
   - Macros detalhados: calorias, proteínas, carboidratos, gorduras (com ícones coloridos)
   - Data/hora da análise

Nenhum outro arquivo precisa ser modificado.

