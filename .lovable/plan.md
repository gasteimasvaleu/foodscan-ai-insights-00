## Aplicar visual rosa aos cards de /profile/diets

Arquivo: `src/pages/MyDiets.tsx` (linhas 187 e 260–296). Mesmo tratamento dos cards de avaliação física, sem alterar fontes nem comportamento.

### 1. Card de cada refeição (linha 187)
Trocar o `className` do `<Card>` por:
```
relative overflow-hidden bg-white/90 backdrop-blur-sm border border-[#FD46A1]/30 rounded-2xl shadow-[0_4px_20px_-4px_rgba(253,70,161,0.25)] before:absolute before:inset-y-3 before:left-0 before:w-1 before:rounded-r-full before:bg-gradient-to-b before:from-[#FD46A1] before:to-[#FF7AC0]
```

Adicionar `pl-5` no `<CardHeader>` para o conteúdo não colidir com a faixa rosa.

### 2. Itens de refeição dentro do CardContent
- Trocar `bg-muted/50` por `bg-[#FFD1E7]/30 border border-[#FD46A1]/15` em cada item (linha 265) para combinar com a paleta.
- Botão de excluir: `text-[#FD46A1]/70 hover:text-[#FD46A1] hover:bg-[#FFD1E7]/40`.
- Total de calorias (linha 283): manter `text-primary` (já é `#FD46A1` via design tokens).

### 3. Estado vazio
Não há card de "nenhuma dieta" separado — quando `group.meals.length === 0` o `CardContent` simplesmente não renderiza. Mantém.

Sem mudanças em dados, schema ou outros componentes.
