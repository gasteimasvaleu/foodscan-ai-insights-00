
Objetivo: deixar os dias do gráfico da Hidratação curtos e organizados de domingo a sábado (esquerda → direita), evitando texto espremido no mobile.

1) Ajustar a origem dos rótulos dos dias em `src/pages/Hydration.tsx`
- Substituir o uso de `format(date, "EEE", { locale: ptBR })` por uma lista fixa:
  - `["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]`.
- Usar `date.getDay()` para mapear corretamente cada dia ao rótulo abreviado.

2) Reordenar o gráfico para semana calendário (Dom → Sáb)
- Alterar o `weeklyData` para montar os 7 dias a partir do início da semana atual:
  - `startOfWeek = hoje - hoje.getDay()`.
  - Iterar `0..6` para garantir ordem fixa domingo primeiro.
- Manter o cálculo de calorias e volume por `consumption_date` exatamente como está (apenas muda a ordem/labels exibidos).

3) Pequeno ajuste visual para não “espremer” no 390x640
- Manter grid de 7 colunas, mas reduzir impacto visual do texto:
  - preservar label curta (3 letras),
  - ajustar classes de texto (`text-[10px]`/`leading-none`) se necessário para caber com folga.
- Não alterar lógica de barras nem dados, só legibilidade.

4) Revisão funcional
- Validar no `/hidratacao`:
  - primeira coluna = `Dom`;
  - sequência completa `Dom, Seg, Ter, Qua, Qui, Sex, Sáb`;
  - calorias continuam corretas por dia;
  - layout legível no viewport 390x640.
