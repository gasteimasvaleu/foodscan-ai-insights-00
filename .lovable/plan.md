## Objetivo

Aplicar no card "Histórico" do `CycleTracker` (`src/components/maternidade/tentantes/CycleTracker.tsx`, linhas 140–186) o mesmo tratamento visual usado nos cards de dia em `/profile/workout` (`src/pages/WorkoutPlan.tsx`, linhas 198–259), para deixar a leitura mais clara e a hierarquia mais bonita. Apenas frontend/visual — sem mudar lógica, dados, queries, ou o Dialog de cadastro.

## Mudanças visuais

### 1. Wrapper do card "Histórico"
Trocar:
```
bg-white/70 backdrop-blur-md border-white/40
```
por:
```
relative overflow-hidden bg-white/90 backdrop-blur-sm
border border-[#FD46A1]/30 rounded-2xl
shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)]
before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1
before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]
```
- CardHeader/Content recebem `pl-5` para respeitar a barra de acento rosa.
- Adicionar um `CardDescription` curto abaixo do título (ex.: "Últimos ciclos registrados") para casar com a hierarquia título + descrição do WorkoutPlan.

### 2. Itens da lista
Trocar o item atual (`p-3 rounded-2xl bg-[#FFD1E7]` + linha simples) pelo padrão dos exercícios:
```
rounded-xl bg-[#FFD1E7]/30 border border-[#FD46A1]/15 p-4 space-y-3
```
Estrutura interna:
- Linha topo: `flex items-start justify-between gap-2`
  - Coluna esquerda (`flex-1 min-w-0`):
    - Título: data formatada (`fmtDate`) em `font-semibold text-sm`, com badge `Ciclo {n}d` ao lado (estilo `bg-[#FFD1E7]/60 text-[#FD46A1] border border-[#FD46A1]/20`, igual ao badge de muscleGroup).
    - Linha meta abaixo (`mt-1 text-xs text-muted-foreground`): `{period_length_days} dias de menstruação` · fluxo capitalizado quando existir.
  - Botão de excluir: `variant="ghost" size="icon"` com ícone `Trash2` (lucide) em `h-8 w-8 text-[#FD46A1]/70 hover:text-[#FD46A1] hover:bg-[#FFD1E7]/40`, substituindo o botão "Excluir" textual.
- Sintomas: se houver, renderizar em uma faixa própria com chips pequenos (mantendo `Badge` branco, `text-[10px]`), agora abaixo do bloco topo (em vez de misturados com os badges principais), até 4 itens + indicador `+N` quando exceder.
- Notas: se houver, renderizar no padrão "tip" do WorkoutPlan:
  ```
  flex gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2
  ```
  com ícone `Info` (lucide) `w-3.5 h-3.5 text-primary mt-0.5 shrink-0` e texto `text-[11px] text-muted-foreground leading-relaxed`.

### 3. Estado vazio
Manter o texto "Nenhum ciclo registrado ainda.", mas envolver no mesmo container estilizado (rounded-xl tracejado leve `border-dashed border-[#FD46A1]/20 bg-[#FFD1E7]/20 p-4 text-center`) para não destoar quando o card estiver vazio.

### 4. Imports adicionais
Adicionar `Trash2` e `Info` de `lucide-react`, e `CardDescription` de `@/components/ui/card`.

## Fora de escopo
- Dialog "Novo ciclo" (mantém o visual atual já glass).
- Card de estatísticas no topo (`Duração média / Variação / Próxima`).
- Lógica de cálculo, queries Supabase, toggles de sintomas, salvamento/remoção.
- Outros componentes de Maternidade.

## Arquivo alterado
- `src/components/maternidade/tentantes/CycleTracker.tsx` (somente o bloco do card "Histórico" e seus imports).
