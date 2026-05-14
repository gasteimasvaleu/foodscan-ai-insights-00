# Mini gráfico semanal no card de hidratação

Adicionar uma terceira coluna no `DailyHydrationSummaryCard.tsx` com 7 mini-barras verticais (seg→dom) representando a % da meta de hidratação batida em cada dia da semana atual. Hoje recebe destaque.

## Layout final do card

```text
[ Garrafa 56px ] [ Título / % / ml / chips +200/+300/+500 ] [ Mini chart 7 barras ]
       shrink-0                  flex-1 min-w-0                       shrink-0 ~52px
```

- Mantém todo o layout atual intacto.
- Nova coluna à direita: `flex flex-col items-center justify-center shrink-0` largura ~52px.
- Pequeno label no topo: "Semana" (`text-[9px] uppercase tracking-wider text-white/80`).
- 7 colunas (`flex items-end gap-[3px] h-12`), cada uma:
  - Trilha de fundo `bg-white/20 rounded-sm w-[4px] h-full`
  - Preenchimento sobreposto `bg-white rounded-sm` com `height: max(8%, pct)` para garantir visibilidade quando 0%.
  - Dia atual: `bg-white` + leve glow (`ring-1 ring-white/60`); demais dias `bg-white/85`.
  - Dia 100%+ ganha um mini-dot dourado no topo (opcional, fácil) — default sem dot.
- Linha de iniciais por baixo: `S T Q Q S S D` (seg→dom), `text-[8px] text-white/70`, hoje em `text-white font-bold`.

## Dados

- Buscar em paralelo com o fetch atual:
  ```ts
  supabase
    .from('hydration_records')
    .select('hydration_impact_ml, consumption_date')
    .eq('user_id', user.id)
    .gte('consumption_date', mondayISO)
    .lte('consumption_date', sundayISO)
  ```
- `mondayISO` = segunda-feira da semana corrente em horário local (usar `formatDateOnly` já existente).
- Agregar localmente em um array `weekly: { date: string; pct: number }[]` de tamanho 7, somando `hydration_impact_ml` por data e dividindo por `goalMl` (clamp 0–100 para a barra; armazenar valor real para o dot dourado quando ≥100).
- Hoje é incluído automaticamente; a barra de hoje reflete `consumedMl` (mantido em sync ao usar quick-add: depois do insert otimista, atualizar também a entrada `weekly` do índice de hoje).

## Mudanças de código

Arquivo único: `src/components/DailyHydrationSummaryCard.tsx`

1. Novo estado `weekly` (`number[]` de 7 percentuais).
2. `fetchData` passa a buscar registros da semana inteira; computa total do dia atual a partir do mesmo conjunto (eliminando a query de hoje, simplificando).
3. `quickAdd` atualiza otimisticamente `consumedMl` e a barra de hoje em `weekly`.
4. Nova subárvore JSX após o bloco do `flex-1` com o mini chart descrito acima.
5. Helpers locais: `getMonday(date)`, `getDayIndex(date)` (0 = segunda).

## Considerações visuais

- Largura adicional: ~52px + gap 3 → cabe em 390px (garrafa 56 + gap 12 + col central flex + col direita 52 + paddings 24 ≈ ok).
- Sem novas dependências.
- Sem mudanças de schema/RLS — `hydration_records` já tem policies de leitura para o próprio usuário.
- Animação: `transition-[height] duration-500 ease-out` nas barras.

## Fora de escopo

- Streak (🔥), próximo lembrete, faltam Xml — podem ser adicionados depois caso queira combinar.
