
## Ajustar Drawer "Adicionar ao Controle Diário" para o padrão do app

O drawer ainda está colado nas bordas e sem a borda rosa. Vou alinhar exatamente ao padrão usado em `Sleep`, `IntermittentFasting`, `Receitas`, `ExerciseForm` e no próprio drawer de Histórico do `FacaEmCasa`.

### Mudança
Em `src/components/faca-em-casa/HomeRecipeCard.tsx`, na linha do `<DrawerContent>` do CTA "Adicionar ao Controle Diário":

Substituir as classes atuais por:
`w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`

Isso entrega:
- **`w-[calc(100%-2rem)]`** → 1rem de respiro à esquerda e à direita.
- **`border-2 border-primary`** → borda rosa do app.
- **`bg-white/70 backdrop-blur-md`** → glassmorphism padrão.
- **`rounded-t-2xl`** → cantos consistentes com os outros drawers.

### Fora do escopo
- Conteúdo interno do drawer (resumo nutricional, `MealTypeSelector`, botão Confirmar) e fluxo de salvar permanecem inalterados.
- Componente base `src/components/ui/drawer.tsx` não é tocado.
