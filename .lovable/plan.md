## Diagnóstico
O indicador de delta de peso (seta + valor) está em `text-emerald-300` / `text-rose-300` sobre o novo fundo magenta — baixíssimo contraste, fica praticamente invisível.

## Mudança em `src/components/DailyAssessmentSummaryCard.tsx` (linhas 180-201)

Envolver o delta em um chip branco translúcido com cores sólidas, semelhante ao chip de IMC:

De:
```tsx
{delta !== null ? (
  <div className="flex items-center gap-1 mt-1.5 text-[11px] font-semibold">
    {delta < 0 ? (
      <>
        <ArrowDown className="w-3 h-3 text-emerald-300" />
        <span className="text-emerald-300">{Math.abs(delta)} kg</span>
      </>
    ) : delta > 0 ? (
      <>
        <ArrowUp className="w-3 h-3 text-rose-300" />
        <span className="text-rose-300">{delta} kg</span>
      </>
    ) : (
      <>
        <Minus className="w-3 h-3 text-white/70" />
        <span className="text-white/70">estável</span>
      </>
    )}
  </div>
) : (
  <span className="text-white/40 text-[10px] mt-1.5">sem comparativo</span>
)}
```

Para:
```tsx
{delta !== null ? (
  <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-bold rounded-full px-2 py-0.5 bg-white/85 ${
    delta < 0 ? 'text-emerald-600' : delta > 0 ? 'text-rose-600' : 'text-slate-600'
  }`}>
    {delta < 0 ? <ArrowDown className="w-3 h-3" /> : delta > 0 ? <ArrowUp className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
    <span>{delta === 0 ? 'estável' : `${Math.abs(delta)} kg`}</span>
  </div>
) : (
  <span className="text-white/70 text-[10px] mt-1.5">sem comparativo</span>
)}
```

- Chip `bg-white/85` igual ao chip de IMC → coerência visual.
- Cores `emerald-600` / `rose-600` sólidas → contraste forte sobre branco.
- "sem comparativo" sobe de `white/40` para `white/70` para também ficar legível.

## Fora do escopo
- Sem mudança em layout, gradiente ou outros elementos.
