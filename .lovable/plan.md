## Objetivo

Transformar a aba **"Meus posts"** em uma visualização de calendário mensal. Dias com posts ficam destacados; ao clicar em um dia, os posts daquela data aparecem em uma lista logo abaixo do calendário.

## Mudanças

### 1. `src/components/nutri-sells/PostHistoryGrid.tsx`

Reescrever para layout calendário:

- **Estado**: `currentMonth` (Date) e `selectedDay` (Date | null, default = hoje).
- **Cálculo**: agrupar `posts` por dia (`yyyy-MM-dd`) usando `created_at` em fuso local pt-BR. Memoizar com `useMemo`.
- **Card calendário** (mesmo wrapper card branco com stripe rosa já adotado):
  - Header: nome do mês + ano (`format(currentMonth, "MMMM yyyy", { locale: ptBR })`, capitalizado) + dois `Button` ghost com `ChevronLeft` / `ChevronRight` para navegar.
  - Linha de cabeçalhos dos dias da semana (D, S, T, Q, Q, S, S) em `grid grid-cols-7 text-xs text-muted-foreground`.
  - Grade `grid grid-cols-7 gap-1` com células 1:1 (`aspect-square`):
    - Dias fora do mês: vazio (opacidade reduzida).
    - Dia com post: célula destacada em `bg-[#FFD1E7] text-[#FD46A1]` com badge contador no canto inferior direito (`text-[10px]`) quando >1.
    - Dia selecionado: ring `ring-2 ring-[#FD46A1]`.
    - Dia atual: borda `border border-[#FD46A1]/40`.
    - Click só ativo em dias com posts.
- **Lista abaixo do calendário**:
  - Se `selectedDay` tem posts → render array de cards (mesmo layout horizontal atual: miniatura 20×20 + tema + tipo + horário + ações Copiar/Baixar/Excluir).
  - Se não tem → mensagem "Nenhum post neste dia".
- **Estado vazio global** (sem nenhum post salvo): mantém o card branco com stripe + mensagem atual ("Você ainda não salvou nenhum post.").

### 2. Dependências
- Usar `date-fns` (já no projeto, presente em outras telas) com `locale/pt-BR` para nomes de mês/dias.
- Ícones `ChevronLeft`, `ChevronRight` do `lucide-react`.

### 3. Fora de escopo
- Sem alterar `useGeneratedPosts` nem schema do banco — a data vem de `created_at`.
- Sem alterar a página `NutricionistaQueVende.tsx` (já passa `posts` para o componente).
- Tabs "Criar" e "Ideias" continuam intocadas.
- Não introduzir o componente `<Calendar />` do shadcn — calendário simples customizado, mais compacto e alinhado ao visual do app.

## Validação

- Conferir no preview mobile (390px) que: o calendário cabe sem scroll horizontal, dias com posts ficam pintados, o dia de hoje aparece destacado, ao tocar em outro dia a lista abaixo atualiza, e as ações (copiar/baixar/excluir) continuam funcionando.