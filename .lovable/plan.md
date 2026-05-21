Mover o bloco da Timeline (`<div>Lançamentos do mês + FinanceTimeline</div>`, linhas 87-99 de `src/pages/Financas.tsx`) para ficar entre o `FinanceCalendar` e o `FinanceChart`.

Ordem final dos blocos na página `/financas`:
1. Cards de resumo (Receitas / Despesas / Saldo)
2. FinanceCalendar
3. **Lançamentos do mês (Timeline)**
4. FinanceChart

Apenas reordenação de JSX, sem alterar lógica, estilos ou componentes.