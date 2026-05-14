# Card de Avaliação Física — UX repaginada

Reescrever `src/components/DailyAssessmentSummaryCard.tsx` com visual premium, peso herói, IMC classificado, sparkline, empty state e quick-action de registrar peso. Sem mudanças de schema.

## Layout

```text
┌──────────────────────────────────────────────────────┐
│  AVALIAÇÃO FÍSICA                          [há 3d]   │
│                                                      │
│   65,0 kg          ╭──╮  ┌─ Normal ─┐                │
│   ↓ 0,8 kg         │12│  │  22,5    │   ╱╲╱─╲       │
│   vs. anterior     │% │  │   IMC    │  ╱      ╲     │
│                    ╰──╯  └──────────┘                │
│                                                      │
│            [ + Registrar peso ]                      │
└──────────────────────────────────────────────────────┘
```

- Wrapper: `bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex flex-col px-3 pt-2.5 pb-6 relative` (mesmo padrão de hidratação/jejum para escapar dos dots).
- Header centralizado: título `text-[10px] uppercase tracking-wider text-white/80` + chip "há Xd" à direita (recência da última medição).

## Hero (peso em destaque)

- Coluna principal:
  - Peso atual `text-4xl font-black text-white leading-none` + "kg" `text-sm text-white/70`.
  - Linha delta: seta + valor + "vs. anterior" (`text-[11px]`). Cor verde se diminuiu, vermelho se aumentou, neutra se estável.
- Ring lateral (BodyFat): 64×64, stroke 6 branco. Centro mostra `{bodyFat}%` + label "%BG" minúsculo.
- Chip de IMC com cor semântica:

| BMI | Faixa | Cor chip |
|---|---|---|
| <18.5 | Abaixo | `bg-sky-400/20 text-sky-200` |
| 18.5–24.9 | Normal | `bg-emerald-400/20 text-emerald-200` |
| 25–29.9 | Sobrepeso | `bg-amber-400/20 text-amber-200` |
| ≥30 | Obesidade | `bg-rose-400/20 text-rose-200` |

  Chip mostra label da faixa + valor IMC abaixo.

## Sparkline

- 7 últimos pesos (até 7 registros mais recentes em `physical_assessments`).
- SVG inline 60×28 no canto direito do hero, stroke `#a5b4fc`, sem eixos. Ponto final destacado.
- Se houver <2 registros, oculta o sparkline.

## Quick-action: Registrar peso

- Botão único `w-full bg-white/15 hover:bg-white/25 rounded-full py-2 text-white text-xs font-bold relative z-10 mt-2`, ícone `Plus` + "Registrar peso".
- Abre um Dialog (glassmorphism `bg-white/70 backdrop-blur-md`) com:
  - Input numérico de peso (kg) — `text-base` (anti-zoom iOS), step 0.1.
  - Botões "Cancelar" / "Salvar" (pink #FD46A1 no Salvar).
- Ao salvar: `insert` em `physical_assessments` com `user_id`, `weight`, `assessment_date = today`, herdando `height` e `body_fat_percentage` da última avaliação (para manter histórico contínuo).
- Após sucesso: toast "+ Peso registrado", recarrega dados do card.
- `e.stopPropagation()` no botão e dentro do dialog para não disparar navegação do card.

## Empty state

- Quando `latest === null`:
  - Ícone `Scale` grande centralizado, label "Comece sua jornada" `text-white text-lg font-bold`.
  - Subtexto `text-[12px] text-white/70`: "Registre sua 1ª avaliação para acompanhar evolução".
  - Botão "Registrar agora" abrindo o mesmo Dialog.

## Remoções

- Botão "Ver Avaliações" (card já navega ao toque na área não-botão).
- Cores `text-red-500` agressivas — vira `text-white` / `text-white/80`.

## Cálculos

- `daysAgo = Math.floor((today - assessment_date) / 86400000)`; chip mostra "hoje", "ontem", "há Xd".
- `bmiClass(bmi)` retorna `{ label, classes }`.
- `delta = latest.weight - previous.weight`, casas decimais 1.

## Dados / backend

- `physical_assessments` sem migração. Carregar `limit(7)` em vez de 2 para alimentar sparkline + delta.
- RLS de insert já existe (usuário só insere para si).

## Animações

- Ring: `transition-all duration-700`.
- Sparkline: `stroke-dasharray` + `stroke-dashoffset` animado uma vez ao montar (~600ms).
- Botão: `active:scale-95 transition-all`.

## Fora de escopo

- Edição/exclusão de avaliações (segue em /profile/assessment).
- Campos extras (massa magra, medidas) — modal só captura peso por enquanto.
- Gráfico expandido — usa `PhysicalEvolutionChart` que já existe na página.
