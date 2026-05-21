# Restilizar Select shadcn (look glass/rosa) — só nos 4 Dialogs Maternidade

## Objetivo
Os Selects dentro dos Dialogs do Maternidade hoje têm aparência neutra (cinza) que destoa do `SectionPicker` (rosa + glassmorphism). Vamos aplicar o mesmo look — **sem trocar a primitiva** (Select shadcn continua, mantendo semântica de form, keyboard nav e Portal que funciona dentro de Dialog).

## Arquivos afetados (4)

1. `src/components/maternidade/bebe/BabyProfileCard.tsx`
2. `src/components/maternidade/bebe/GrowthSleep.tsx`
3. `src/components/maternidade/bebe/sleep/SleepDiaryAdvanced.tsx`
4. `src/components/maternidade/tentantes/CycleTracker.tsx`

## Abordagem

Criar **dois pequenos wrappers locais** em `src/components/maternidade/GlassSelect.tsx`:

- `GlassSelectTrigger` — re-exporta `SelectTrigger` com classes:
  - `h-12 rounded-xl bg-white/70 backdrop-blur-md border-0 text-base text-[#FD46A1] font-medium`
  - chevron rosa (herda `text-[#FD46A1]`)
- `GlassSelectContent` — re-exporta `SelectContent` com classes:
  - `bg-white/90 backdrop-blur-md border-2 border-primary rounded-2xl shadow-xl`
- `GlassSelectItem` — re-exporta `SelectItem` com:
  - `text-base rounded-xl my-1 focus:bg-[#FD46A1] focus:text-white data-[state=checked]:bg-[#FD46A1] data-[state=checked]:text-white`

Os componentes base (`Select`, `SelectValue`) continuam vindo de `@/components/ui/select`. O wrapper só padroniza o visual.

## Migração nos 4 arquivos

Em cada arquivo, trocar imports:

```ts
// antes
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// depois
import { Select, SelectValue } from '@/components/ui/select';
import {
  GlassSelectTrigger as SelectTrigger,
  GlassSelectContent as SelectContent,
  GlassSelectItem as SelectItem,
} from '@/components/maternidade/GlassSelect';
```

Assim **o JSX dos 4 arquivos não muda** — só os imports. Zero risco de regredir lógica.

## Fora do escopo

- Não toca em PortionSelector / MultipleElementsPortionSelector / AIGoalsWizard / MatDatePicker.
- Não mexe nos Selects já migrados pra `SectionPicker`.
- Sem mudança de API, sem mudança de lógica/dados.
- Não altera o `Select` global do projeto (outros lugares continuam com o look neutro).

## Resultado visual

Selects dentro dos modais de Maternidade passam a ter:
- Trigger rosa com fundo translúcido (igual ao SectionPicker)
- Content em card glass com borda rosa
- Item selecionado em fundo `#FD46A1` branco
