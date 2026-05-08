## Diagnóstico

O `SecondaryDeckRow` já carrega dados reais dos últimos 7 dias (refeições, hidratação, exercícios, BMR, HealthKit) — mesma lógica do `ChartsProgress`. O problema é provavelmente um destes:

1. **Estado vazio aparecendo indevidamente**: a guarda `data.some(d => d.balance !== 0)` esconde o gráfico se todos os dias dão exatamente 0 (ex: usuário sem BMR cadastrado e sem exercícios → balance = consumed, mas se também não tem refeições → tudo zero).
2. **Chart pouco visível**: só renderiza a barra `balance`, sem eixo Y, sem valores, sem comparação. Em altura pequena (~80px) fica difícil enxergar.
3. **Nenhum log de erro**: se uma das queries falhar silenciosamente, o array fica zerado.

## Melhorias em `src/components/SecondaryDeckRow.tsx`

### 1. Mostrar o gráfico sempre que houver qualquer atividade
Trocar a guarda por `data.some(d => d.balance !== 0 || d.consumed > 0 || d.burned > 0)` — só mostra estado vazio se realmente não houver nada nos 7 dias.

### 2. Gráfico mais informativo (consumed vs burned)
Renderizar **duas barras finas lado a lado** por dia:
- `consumed` em rosa (`#FD46A1`)
- `burned` em rosa claro (`#FFD1E7` com borda) ou cinza claro (`#E5E7EB`)

Assim o "balanço" fica visível pela diferença das alturas, e o card vira um mini-resumo semanal real.

### 3. Footer com balanço total da semana
Logo abaixo do mini gráfico, uma linha pequena mostrando:
```
Saldo: -1.240 kcal  (Déficit)
```
- Verde/rosa para superávit, vermelho suave para déficit.
- `text-[11px]` para caber.

### 4. Tooltip leve ao tocar
Manter `Tooltip` desativado para não conflitar com o `onClick` do card (toque no card → vai para `/graficos-progresso`).

### 5. Log de erro visível em dev
Manter `console.error`, e adicionar um fallback: se as queries retornarem 0 linhas mas o usuário existir, ainda mostrar a estrutura do gráfico (eixo X com os 7 dias) em vez do estado vazio — assim o card nunca parece "quebrado".

## Resultado

- Mini gráfico real sempre visível (consumido vs gasto por dia).
- Saldo semanal calculado abaixo.
- Estado vazio só aparece para usuários totalmente sem dados.
