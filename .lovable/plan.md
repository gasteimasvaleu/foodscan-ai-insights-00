## Ajustes de layout no card de Avaliação Física

Editar somente `src/components/DailyAssessmentSummaryCard.tsx`, sem mexer em lógica de dados.

### 1. Header com mais respiro
- Aumentar o padding superior do wrapper: `pt-2.5` → `pt-4` (afasta título e badge "hoje" da borda de cima).
- Aumentar margem inferior do header: `mb-2` → `mb-4`.

### 2. Remover sparkline do bloco do peso
- Excluir o bloco `<div className="mt-1.5 h-[28px] flex items-center">…Sparkline…</div>` (linhas 225-231).
- Remover também o componente `Sparkline` e seu import de ícones não usados.
- A coluna de peso fica só com: número grande + linha "↑ X kg vs. anterior".

### 3. Três colunas com mesma altura, todas centralizadas verticalmente
- Container hero: trocar `flex items-center justify-between gap-2 flex-1` por `grid grid-cols-3 items-center gap-2 flex-1`.
- Cada coluna ocupa 1/3 com `flex flex-col items-center justify-center h-full`:
  - Col 1 (peso): centralizar texto (`items-center text-center`), número + delta empilhados.
  - Col 2 (anel BG): já centralizado, só envolver em `flex items-center justify-center h-full` para alinhar com as outras.
  - Col 3 (chip IMC): igual, `flex items-center justify-center h-full`; chip mantém `rounded-2xl` e tamanhos.
- Se `bodyFat` for null, col 2 renderiza placeholder vazio para preservar o grid.

### 4. Resultado visual
- Título "AVALIAÇÃO FÍSICA" e badge "hoje" descem ~6px.
- Peso fica centralizado em sua coluna, sem espaço vazio embaixo (sparkline removido).
- Anel BG centralizado na coluna do meio.
- Chip IMC alinhado às outras duas colunas, mesma altura.
- Botão "Registrar peso" permanece igual.

Nenhuma mudança em backend, RLS, queries ou estado.
