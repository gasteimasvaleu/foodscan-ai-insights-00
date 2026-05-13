## Mudanças em `src/pages/QuizPlay.tsx`

### Padronização do layout
- Trocar `bg-[#F7FAFB]` por `bg-background` para alinhar com o resto do app.
- Adicionar `<Navbar />` no topo (mesmo import usado em `Quiz.tsx`).
- Trocar wrapper para `min-h-screen bg-background pb-32` e container para `container max-w-lg mx-auto px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4` (igual ao Quiz.tsx).
- Loading e estado "vazio" também recebem Navbar + mesmo background.

### Novo card de cabeçalho do quiz (incrível)
- Buscar também `title` e `theme` em `quizzes` no `init()` e guardar em estado (`quizMeta`).
- Acima das perguntas, renderizar header card com a mesma estética glass do card da listagem:
  - wrapper `bg-[#FFD1E7] rounded-[32px] p-1 shadow-[0_20px_50px_rgba(253,70,161,0.15)]`
  - interior `bg-white/40 rounded-[28px] p-5 backdrop-blur-sm border border-white/50 space-y-3`
  - chip do tema (bg branco, texto rosa uppercase) + chip rosa "Pergunta X / N"
  - Título `text-xl font-bold text-[#FD46A1] leading-tight`
  - Linha inferior: ícone Clock + "Xs restantes" à esquerda, % de progresso à direita
  - Barras de progresso integradas ao card (progress geral e timer), cor `bg-[#FD46A1]`
- Remover o bloco antigo de "Pergunta X de N" + dois `<Progress>` soltos (movidos para o card).

### Card de pergunta
- Manter o `Card` branco com perguntas/respostas como está, mas:
  - Trocar `rounded-3xl` por `rounded-[28px]` para combinar.
  - Alterar destaque do escolhido para usar a primária (`#FD46A1`) com texto branco quando selecionada antes do feedback.
  - Pequeno `shadow-sm` para dar profundidade.

### Sem mudanças
- Lógica de timer, submit, navegação, edge functions, banco — nada disso muda.
- Sem novas dependências; usar `lucide-react` (`Clock`) já disponível.

## Verificação
- Build automático.
- Conferir no preview /quiz/{id}: navbar visível, fundo `bg-background`, novo header card mostrando título + tema + progresso, perguntas funcionando.