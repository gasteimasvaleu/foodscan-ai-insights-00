## Melhorar UX do header de cada avaliação física

Arquivo: `src/pages/PhysicalAssessment.tsx` (linhas 352–372). Mantém todas as fontes (`text-base` no título, `text-sm` nas métricas) e o botão de excluir.

### Problemas atuais
- Métricas em uma linha contínua separada por `|` — difícil de escanear no mobile (390px).
- "19.96%" mostra precisão excessiva.
- Sem destaque visual da métrica principal (peso).
- Falta comparação com a avaliação anterior (delta), que é a informação mais útil.
- Data por extenso ocupa muito espaço ("13 de maio de 2026") competindo com o botão de lixeira.

### Proposta

**1. Título mais compacto + delta vs anterior**
- Trocar `"dd 'de' MMMM 'de' yyyy"` por `"dd MMM yyyy"` ("13 mai 2026"), liberando espaço.
- Logo abaixo da data, um pequeno chip: `↓ 0,5 kg desde 06 mai` (verde se peso caiu, vermelho se subiu, neutro se primeira). Calcula com base no `assessments[index + 1]` (lista vem ordenada desc).

**2. Métricas como chips em linha**
Substituir o `CardDescription` com pipes por 3 chips compactos `flex flex-wrap gap-2 mt-2`:
- `bg-muted rounded-full px-2.5 py-1 text-sm` cada um
- `Peso 70 kg` · `Gordura 20%` (arredondar com `Math.round`) · `Magra 55 kg`
- Mesma `text-sm`, mas hierarquia visual clara e tap-friendly.

**3. Botão editar + excluir agrupados**
- Atualmente só tem `Trash2`. Adicionar um botão `Edit` ao lado (já existe `editingId` no state e o ícone `Edit` já está importado mas não usado). Handler: pré-popular `formData` com os valores da assessment e abrir `dialogOpen`.
- Ambos `variant="ghost" size="icon"` em um `flex gap-1`.

### Resultado visual

```text
13 mai 2026                            [✎] [🗑]
↓ 0,5 kg desde 06 mai
[Peso 70 kg] [Gordura 20%] [Magra 55 kg]
```

### Detalhes técnicos
- Helper inline `formatDelta(current, previous)` retornando `{ label, tone: 'down' | 'up' | 'neutral' }` usando classes semânticas (`text-emerald-600`, `text-rose-600`, `text-muted-foreground`).
- `Math.round(body_fat_percentage)` para o chip; mantém o valor cru no banco.
- Handler `handleEdit(assessment)` que faz `setFormData({...stringified values})`, `setBeforePhoto(null)`, `setAfterPhoto(null)`, `setEditingId(assessment.id)`, `setDialogOpen(true)`. O `saveAssessment` existente já trata `editingId` (verificar e ajustar se necessário — caso só faça insert, adicionar branch de update).

Sem mudanças em schema, RLS, ou outros componentes.
