# Reposicionar mini-chart semanal

Reestruturar o `DailyHydrationSummaryCard.tsx` em duas linhas:

```text
┌─────────────────────────────────────────────────────────┐
│  [Garrafa]   Título                       [7 barrinhas] │
│              30%                          S T Q Q S S D │
│              500 / 3000 ml                              │
│                                                         │
│         [ +200 ]  [ +300 ]  [ +500 ]                    │
└─────────────────────────────────────────────────────────┘
```

## Mudanças

1. Wrapper externo passa de `flex items-stretch` para `flex flex-col` mantendo `px-3 py-2.5`.
2. Linha superior: `flex items-center gap-2.5 flex-1`
   - Coluna 1: garrafa (inalterada).
   - Coluna 2 (`flex-1 min-w-0`): título + percentual/Meta batida + "X / Y ml" (sem os botões).
   - Coluna 3: mini-chart semanal (7 barras + iniciais), `shrink-0`, alinhado verticalmente ao centro da coluna de texto.
3. Linha inferior: `flex items-center gap-1.5 mt-2` com os 3 botões `+200/+300/+500` ocupando toda a largura do card (`flex-1` cada).
4. Padding lateral simétrico: a margem direita do mini-chart até a borda passa a ser igual ao `px-3` que a garrafa já usa do lado esquerdo (basta confiar no `px-3` do wrapper — sem padding extra na coluna do chart).
5. Mini-chart preserva: barras `h-12`, destaque do dia atual, dot dourado para 100%, label "Semana" no topo e iniciais embaixo.

Sem mudanças de dados, schema ou estilos globais.
