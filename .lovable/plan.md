

## Ajustar título da data nas avaliações físicas

### Mudança

**`src/pages/PhysicalAssessment.tsx` (linha ~228)** — Remover o emoji 📅 do `CardTitle` e reduzir o tamanho da fonte para caber em uma linha:

```tsx
// De:
<CardTitle>
  📅 {format(new Date(assessment.assessment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
</CardTitle>

// Para:
<CardTitle className="text-base">
  {format(new Date(assessment.assessment_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
</CardTitle>
```

