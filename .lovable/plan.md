# Card Apple Health com anel de progresso

## Conectado: anel estilo Activity
- SVG circular ocupando o centro do card 4:5 (~120px). Track de fundo `stroke-white/40`, progresso `stroke-[#FD46A1]` com `strokeLinecap="round"`, espessura ~10px.
- Progresso = `min(dailySteps / 10000, 1) * circunferência`. Animação suave via `transition-[stroke-dashoffset]`.
- No centro do anel: ícone `Footprints` pequeno em cima e número de passos em `text-2xl font-bold text-[#FD46A1]` logo abaixo.
- Abaixo do anel, fora dele: label `text-base text-foreground` "Passos hoje" + sublabel `text-[11px] text-foreground/60` "Meta 10.000".
- Card mantém `bg-[#FFD1E7]`, `rounded-3xl`, `aspect-[4/5]`. Clique segue indo para `/fit-tracker`.

## Não conectado: ilustração + CTA limpa
- Ícone `Heart` grande (w-12 h-12) em círculo branco translúcido no topo.
- Título `text-base text-foreground` "Apple Health".
- Subtítulo `text-[11px] text-foreground/60` "Acompanhe seus passos".
- Botão pílula pequeno embaixo: `bg-[#FD46A1] text-white text-xs font-medium px-3 py-1.5 rounded-full` com texto "Conectar".
- Card todo segue clicável → `/fit-tracker`.

## Implementação
- Tudo dentro do botão direito do `src/components/HeroDeckRow.tsx`.
- Constante local `STEP_GOAL = 10000`.
- Componente inline `<StepsRing value={steps} goal={STEP_GOAL} />` ou JSX direto com `<svg viewBox="0 0 100 100">`. Sem libs novas.
- Sem mudanças no `useHealthKit` nem em outros arquivos.