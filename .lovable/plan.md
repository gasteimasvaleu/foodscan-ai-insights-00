## Ocultar CardContent vazio em PhysicalAssessment

Em `src/pages/PhysicalAssessment.tsx` (linhas 374–400), envolver o `<CardContent>` em uma condição que só renderiza se houver pelo menos uma das três coisas:

```tsx
{(assessment.before_photo_url || assessment.after_photo_url || assessment.notes) && (
  <CardContent>
    ...
  </CardContent>
)}
```

Resultado: quando a avaliação só tem peso/gordura/massa magra (já exibidos no `CardHeader`), o card termina no header sem espaço em branco extra. Sem outras mudanças.