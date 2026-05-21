## Página Finanças

Nova área para o usuário controlar receitas e despesas pessoais. Free no Menu + → Recursos Extras.

### Banco (Supabase)
Nova tabela `finance_transactions`:
- `user_id` (uuid)
- `kind` ('receita' | 'despesa')
- `amount_cents` (int)
- `category` (text) — presets: Mercado, Transporte, Lazer, Saúde, Casa, Contas, Trabalho, Outros
- `description` (text, opcional)
- `occurred_on` (date)
- `created_at`, `updated_at`

RLS: cada usuário só vê/edita/apaga os próprios registros. Índices em `(user_id, occurred_on)`.

### Rotas
- `/financas` — calendário mensal + gráfico + resumo do mês
- `/financas/:date` — detalhes do dia (lista, adicionar, editar, excluir)

### `/financas` — layout
1. Header padrão "Finanças" (gradiente rosa, estilo Page Headers).
2. Cards resumo do mês: Receitas, Despesas, Saldo (cores semânticas, sem ícones decorativos no título).
3. **Calendário mensal** custom (não shadcn Calendar — precisa de badges) baseado em `date-fns`:
   - Grid 7×6, navegação ◀ mês ▶.
   - Cada dia mostra ponto verde (receita) e/ou rosa (despesa) quando há lançamentos.
   - Tap no dia → navega para `/financas/:date` (YYYY-MM-DD).
   - Dia atual destacado com anel `#FD46A1`.
4. **Gráfico Receita × Despesa do mês atual** (Recharts, já no projeto):
   - `ComposedChart` com barras agrupadas por dia (1..N), receita verde e despesa rosa, mais linha de saldo acumulado.
   - Tooltip custom em pt-BR formatado em R$, grid suave, sem eixo Y poluído.
   - Card branco arredondado, glassmorphism leve.

### `/financas/:date` — layout
1. Header com data formatada ("Quinta, 21 mai").
2. Botão flutuante "+ Adicionar" abre modal (glassmorphism) com:
   - Toggle Receita/Despesa
   - Valor (input numérico R$, `text-base` para evitar zoom iOS)
   - Categoria (Select com presets)
   - Descrição (opcional)
   - Salvar (bg `#FD46A1`)
3. Lista de lançamentos do dia agrupados (Receitas / Despesas), com swipe-like actions: editar / excluir (confirmação).
4. Totais do dia no topo da lista.

### Menu +
Adicionar em `src/components/ui/tubelight-navbar.tsx` na lista `moreSheetItems` como `isExtra: true, isPro: false`:
- Nome: "Finanças"
- Descrição: "Controle suas receitas, despesas e o saldo do mês"
- Ícone: `Wallet` (lucide)
- Rota: `/financas`

### Arquivos novos
- `supabase/migrations/...sql` (tabela + RLS + trigger updated_at)
- `src/pages/Financas.tsx`
- `src/pages/FinancasDia.tsx`
- `src/components/financas/FinanceCalendar.tsx`
- `src/components/financas/FinanceChart.tsx`
- `src/components/financas/TransactionModal.tsx`
- `src/hooks/useFinanceTransactions.ts`
- `src/lib/financas/categories.ts` + `formatters.ts`
- Rotas registradas em `src/App.tsx`
- Item adicionado em `tubelight-navbar.tsx`

Nada de pagamento/Stripe envolvido. Apenas dados locais por usuário no Supabase.