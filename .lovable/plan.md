## Timeline de Lançamentos

Adicionar um componente de timeline vertical com nós luminosos e cards glassmorphism, exibindo receitas e despesas cadastradas.

### Novo componente

`src/components/financas/FinanceTimeline.tsx`
- Props: `items: FinanceTx[]`, `onItemClick?: (date: string) => void`
- Linha vertical à esquerda com gradiente rosa (`from-[#FD46A1]/40 via-[#FD46A1]/20 to-transparent`)
- Cada nó é um círculo com glow (`shadow-[0_0_12px]`) — verde esmeralda para receita, rosa #FD46A1 para despesa
- Card glassmorphism (`bg-white/70 backdrop-blur-md border border-white/40 rounded-2xl`) com:
  - Data formatada ("21 mai") como destaque pequeno
  - Categoria como título (`text-base`, sem ícones — segue padrão de cards)
  - Descrição em `text-xs text-foreground/70` (oculta se vazia)
  - Valor formatado em BRL alinhado à direita, colorido pelo tipo
- Clicável: navega para `/financas/{occurred_on}` via callback

### Integração em /financas (Financas.tsx)

- Abaixo do `FinanceChart`, nova seção "Lançamentos do mês"
- Usa as transações já carregadas do mês, ordenadas por `occurred_on` desc e `created_at` desc (mais recentes primeiro)
- Clique no nó navega para o dia
- Estado vazio: mensagem discreta "Nenhum lançamento neste mês"

### Integração em /financas/:date (FinancasDia.tsx)

- Substitui a lista atual de transações pelo `FinanceTimeline`
- Items ordenados por `created_at` desc
- Clique abre o modal de edição (mantém comportamento atual — passamos `onItemClick` que dispara `openEdit` em vez de navegação)
- Mantém os botões de delete/edit por swipe ou ação rápida no card

### Detalhes técnicos

- Reusa `formatBRL` e `toDateKey` de `src/lib/financas/formatters.ts`
- Para data curta no dashboard: `new Date(occurred_on).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })`
- Sem alterações no banco — apenas UI sobre `finance_transactions`
- Sem novas dependências
