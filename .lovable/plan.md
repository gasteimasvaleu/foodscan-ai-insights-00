## Objetivo

Adicionar uma segunda linha de cards na home, logo abaixo dos cards de "Último treino" e "Apple Health", invertendo o layout: card menor (formato vertical, Loja) à esquerda e card maior 16:9 (mini gráfico de Balanço Calórico) à direita.

## Novo componente: `src/components/SecondaryDeckRow.tsx`

Mesma linguagem visual do `HeroDeckRow` (rounded-3xl, shadow-lg, active:scale, navegação por toque), com grid invertido:

```text
grid-cols-[1fr_1.6fr]   // esquerda menor, direita maior
```

### Card esquerdo — Loja (proporção 4:5)

- `onClick` → `navigate('/loja')`.
- Background: imagem `https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/gpt-image-2-edit-1%20(1).png` em `object-cover absolute inset-0`.
- Botão flutuante "Comprar" centralizado na base, mesmo estilo do botão "Conectar" do card Apple Health (`bg-[#FD46A1] text-white text-xs px-4 py-1.5 rounded-full shadow-md`).
- `aspect-[4/5]` para casar a altura do card direito.

### Card direito — Mini Balanço Calórico (proporção 16:9 ≈ casa altura do 4:5 do esquerdo? não)

Nota técnica: o card esquerdo a `1fr` com `aspect-[4/5]` define a altura. Para o card direito (`1.6fr`) ficar com a mesma altura, usaremos `h-full` no botão e dentro renderizamos o conteúdo. O "formato 16:9" será respeitado visualmente pelo gráfico interno; o card em si esticará à altura do esquerdo, igual já fazemos no `HeroDeckRow`.

Conteúdo:
- `onClick` → `navigate('/graficos-progresso')`.
- Background: gradiente `bg-gradient-to-b from-[#FFD1E7] to-white` + `border border-[#FD46A1]/40` (mesma estética do card Apple Health, para consistência).
- Header interno compacto: label "Balanço Calórico" (text-[10px] uppercase tracking-wide text-foreground/60) e título curto (text-base).
- Mini `BarChart` (recharts) em `ResponsiveContainer` com altura ocupando o restante do card:
  - Dados: últimos 7 dias com `consumed`, `burned`, `balance` — mesma lógica de `loadCalorieBalance` em `ChartsProgress.tsx` (consultas a `meal_records`, `hydration_records`, `exercise_records`, soma BMR de `profiles.basal_metabolic_rate`, e calorias do HealthKit via `useHealthKit.getWeeklyData()` quando conectado).
  - Renderiza apenas a barra `balance` (uma cor por sinal: rosa `#FD46A1` para superávit, vermelho suave para déficit) com eixo X mínimo (dias abreviados) e sem eixo Y/legend para caber no card pequeno.
  - `CartesianGrid` desabilitado, `Tooltip` opcional desativado para evitar conflitos com o `onClick` do card.
- Estado vazio (sem dados): ícone `BarChart3` centralizado + texto "Toque para ver" (mesmo padrão dos outros cards).

Para evitar duplicar a lógica grande, o componente carrega os dados num `useEffect` próprio (independente de ChartsProgress). É uma versão enxuta — só calcula `balance` por dia, sem BMR calculator UI.

## Integração em `src/pages/Index.tsx`

Importar `SecondaryDeckRow` e renderizar logo após `<HeroDeckRow />`:

```tsx
<HeroDeckRow />
<SecondaryDeckRow />
<QuickActions />
```

## Resultado

- Nova fileira de 2 cards abaixo da existente.
- Esquerda (menor, 4:5): card da Loja com imagem de fundo e botão "Comprar".
- Direita (maior): mini-gráfico de Balanço Calórico dos últimos 7 dias, leva para `/graficos-progresso`.
- Visual e interações consistentes com o `HeroDeckRow`.
