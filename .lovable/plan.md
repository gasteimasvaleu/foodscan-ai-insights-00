# Card de Jejum Intermitente — UX repaginada

Reescrever `src/components/DailyFastingSummaryCard.tsx` aplicando os 4 upgrades aprovados, sem mini-chart semanal.

## Estados (state machine)

1. **idle** (sem jejum ativo): hero "Pronto para começar?" + 3 chips quick-start.
2. **fasting** (em andamento): hero do tempo restante grande + ring grande + fase atual + botão "Encerrar".
3. **completed** (atingiu `target_hours` enquanto ativo): gradiente celebrativo + Trophy + tempo total + botão "Encerrar jejum".

## Layout

```text
┌──────────────────────────────────────────────────────┐
│  JEJUM INTERMITENTE                          16:8    │
│  ┌──────┐                                            │
│  │      │   15h59           🔥 Queima de gordura     │
│  │ Ring │   restantes       Decorrido 0h01           │
│  │ 0%   │                                            │
│  └──────┘                                            │
│                                                      │
│      [ 16:8 ]  [ 18:6 ]  [ 20:4 ]   ← idle           │
│      ou  [ Encerrar jejum ]         ← fasting        │
└──────────────────────────────────────────────────────┘
```

- Wrapper: `flex flex-col px-3 pt-2.5 pb-6` (mesmo padrão do card de hidratação para os botões escaparem dos dots do carrossel).
- Linha superior: título à esquerda, protocolo ativo à direita (`text-[10px]` chip `bg-white/20`).
- Hero: `flex items-center gap-4 flex-1`
  - Ring grande: 110×110, stroke 8, gradient stroke (`linear-gradient(135deg, white, #fde68a)` quando concluído). Centro mostra `{percentage}%` em `text-2xl font-black` + ícone `Timer` w-5.
  - Coluna texto (`flex-1 min-w-0`):
    - Tempo principal `text-4xl font-black leading-none` (restante em fasting, "00h00" em idle, total atingido em completed).
    - Label `text-[11px] text-white/80`: "restantes" / "para começar" / "meta atingida".
    - Fase atual com ícone + label colorida (somente em fasting).
    - Linha auxiliar: "Decorrido Xh", "Meta Yh" em `text-[11px]`.

## Fase do jejum (baseada em `elapsedHours`)

| Faixa | Fase | Ícone | Cor texto |
|---|---|---|---|
| 0–4h | Digestão | `Utensils` | `text-amber-200` |
| 4–8h | Reservas (glicogênio) | `Battery` | `text-sky-200` |
| 8–14h | Queima de gordura | `Flame` | `text-orange-200` |
| 14–18h | Cetose | `Zap` | `text-yellow-200` |
| 18h+ | Autofagia | `Sparkles` | `text-emerald-200` |

Constante local `FAST_PHASES` no topo do componente.

## Quick-start (idle) e Encerrar (fasting)

- 3 chips `[16:8 / 18:6 / 20:4]` (`flex-1`, `bg-white/25 rounded-full px-2 py-1.5 text-[12px] font-bold`) com clique chamando `startFast(protocol)`:
  ```ts
  await supabase.from('fasting_records').insert({
    user_id, target_hours, protocol
  });
  ```
  Atualiza estado local + toast "Jejum iniciado 🔥". `e.stopPropagation()` para não navegar.
- Em fasting/completed: um único botão `Encerrar jejum` ocupa toda a largura, `bg-white/30 hover:bg-white/40 rounded-full py-2 text-xs font-bold`, chama `stopFast()` que faz `update({ ended_at: now })`.

## Estado celebrativo (completed)

- `goalReached = elapsedHours >= targetHours && isFasting`.
- Gradiente troca de `from-purple-500 via-violet-500 to-indigo-600` para `from-amber-400 via-orange-400 to-emerald-500`.
- Ring fica dourado (stroke `#fde68a`).
- Hero mostra `Trophy` ao lado do tempo, label "Meta atingida!".

## Remoções

- Remover `<button>Ver Jejum<ChevronRight/></button>` (card inteiro já navega).
- Remover barra de progresso inferior (duplicava o ring).
- Remover lateral "decorrido" como coluna separada — vira linha auxiliar.

## Dados / backend

- `fasting_records` (insert/update já existem na página /jejum) — sem migração.
- RLS já permite ao usuário criar/atualizar seus próprios registros.

## Animações

- Ring: `transition-all duration-700 ease-out` no `strokeDashoffset`.
- Mudança de gradiente: `transition-colors duration-500`.
- Pulso leve no Flame durante fase ativa de queima: `animate-pulse`.

## Tipografia (alinhada ao card de hidratação)

- Título: `text-xs uppercase tracking-wider`.
- Tempo hero: `text-4xl font-black`.
- Decorrido/meta: `text-[11px]`.
- Chips: `text-[12px]`.

## Fora de escopo

- Mini-chart semanal (descartado pelo usuário).
- Edição de protocolo customizado (continua em `/jejum`).
- Notificações push de marco de fase.
