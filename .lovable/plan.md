
Objetivo: aplicar no `/receitas` o mesmo padrão usado no “Registrar Exercício” para os campos **Dieta** e **Culinária** (botão acionador + Drawer com Wheel Picker + Cancelar/Confirmar), mantendo a lógica de busca intacta.

1) Atualizar estrutura da página `src/pages/Receitas.tsx`
- Adicionar imports de `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerFooter`, `WheelPicker` e `ChevronDown`.
- Remover uso de `Select`/`SelectTrigger`/`SelectContent`/`SelectItem` nesses dois filtros.

2) Criar estados locais para cada filtro
- Controle de abertura:
  - `isDietDrawerOpen`
  - `isCuisineDrawerOpen`
- Valores temporários (pré-confirmação):
  - `pendingDiet`
  - `pendingCuisine`
- Manter `diet` e `cuisine` como fonte final usada no `searchRecipes`.

3) Implementar gatilhos visuais no card de busca
- Substituir os dois selects por botões `variant="outline"` com `ChevronDown`.
- Exibir label selecionada no botão:
  - Dieta: valor atual ou “Dieta”
  - Culinária: valor atual ou “Culinária”
- Ao abrir Drawer, carregar pending com valor atual; se vazio, iniciar em “Todas”.

4) Implementar Drawers com padrão visual dos modais
- Para Dieta e Culinária, criar um Drawer cada com:
  - título do campo
  - `WheelPicker` com opções do array correspondente
  - ações `Cancelar` e `Confirmar`
- Aplicar o mesmo estilo glassmorphism já adotado:
  - `w-[calc(100%-2rem)] max-w-md rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`
  - botões: cancel `rounded-xl`, confirmar `bg-primary hover:bg-primary/90 text-white rounded-xl`.

5) Ajuste de dados e compatibilidade da busca
- Usar opções em formato `{ label, value }` no Wheel para preservar texto PT-BR e valor enviado à API.
- Tratar “Todas” como valor vazio (`""`) ao confirmar, para manter:
  - `diet: diet || undefined`
  - `cuisine: cuisine || undefined`
- Garantir que `clearSearch()` continue resetando ambos para vazio sem quebrar UI.

6) Validação funcional (390x640)
- Abrir cada Drawer, girar Wheel, cancelar e confirmar.
- Confirmar exibição correta dos textos nos botões.
- Buscar receitas com e sem filtros e validar paginação (“Carregar mais”) sem regressões.
