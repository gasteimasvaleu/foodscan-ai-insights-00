# Migração de Selects → Drawer (SectionPicker)

## Descoberta importante

Ao verificar o contexto de cada `Select` encontrado, descobri que **vários estão dentro de `Dialog`** — e a regra core do projeto diz **"Never use Drawer-based pickers inside Dialogs"** (problema de stacking no iOS). Esses precisam **permanecer como Select/Popover**.

## Classificação

### ✅ Migrar para Drawer (6 arquivos — fora de Dialog)

Páginas inteiras (sem Dialog ao redor):
1. `src/pages/AdminSubscriptions.tsx` — filtro de status
2. `src/pages/ServiNUTRI.tsx` — seletor(es) de filtro
3. `src/pages/Treinos.tsx` — seletor(es) de filtro

Componentes Maternidade sem Dialog:
4. `src/components/maternidade/bebe/BabyNames.tsx`
5. `src/components/maternidade/bebe/sleep/WakeWindowCalculator.tsx`
6. `src/components/maternidade/bebe/sleep/RoutineGenerator.tsx`

### 🚫 Manter como está (não migrar)

**Dentro de Dialog (violaria regra de stacking):**
- `src/components/maternidade/bebe/BabyProfileCard.tsx`
- `src/components/maternidade/bebe/GrowthSleep.tsx`
- `src/components/maternidade/bebe/sleep/SleepDiaryAdvanced.tsx`
- `src/components/maternidade/tentantes/CycleTracker.tsx`

**Dentro de modais (FoodScan):**
- `src/components/PortionSelector.tsx`
- `src/components/MultipleElementsPortionSelector.tsx`

**Casos especiais (não cabem em Drawer simples):**
- `src/components/maternidade/MatDatePicker.tsx` — é calendário, Popover faz sentido
- `src/components/AIGoalsWizard.tsx` — Popover dentro de wizard

## Abordagem técnica

Reutilizar o componente existente `src/components/maternidade/SectionPicker.tsx` (Drawer com glassmorphism, fundo `bg-white/70 backdrop-blur-md`, accent `#FD46A1`, check no selecionado). Ele já segue 100% o design system.

Para cada Select migrado:
1. Substituir `<Select>` + `<SelectTrigger>` + `<SelectContent>` + `<SelectItem>` por `<SectionPicker options={...} value={...} onChange={...} title="..." />`
2. Converter a lista de itens em `{ id, label }[]`
3. Remover imports não utilizados de `@/components/ui/select`

Se algum Select tiver agrupamento ou conteúdo customizado (ícone + label), avalio caso a caso e — se necessário — estendo o `SectionPicker` para aceitar um `renderOption` opcional (em vez de criar um novo componente).

## Fora do escopo

- Não tocar nos Selects dentro de Dialog
- Não tocar nos PortionSelectors
- Não mexer em date pickers nem no AIGoalsWizard
- Sem mudanças de lógica/dados — apenas troca visual do controle
