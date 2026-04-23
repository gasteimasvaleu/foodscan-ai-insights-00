

## Card de Avaliação Física em tons claros (cinza → branco)

Trocar o gradiente atual (teal/emerald/cyan) por um fundo claro **cinza claro → branco**, ajustando todos os textos/ícones internos que hoje são brancos para **preto** (texto principal) e **vermelho** (destaques numéricos), mantendo legibilidade no novo fundo.

### Mudanças em `src/components/DailyAssessmentSummaryCard.tsx`

**Fundo (loading + card principal):**
- `from-teal-500 via-emerald-500 to-cyan-500` → `from-gray-100 via-gray-50 to-white`
- Adicionar `border border-gray-200` para dar contorno suave (já que perde contraste com fundo do app).

**Título "Avaliação Física":**
- `text-white/90` → `text-gray-700`

**Números de destaque (peso, IMC, % gordura no centro do anel):**
- `text-white` → `text-red-500` (vermelho para os números principais)

**Labels secundários ("kg atual", "IMC", "sem peso"):**
- `text-white/70` → `text-gray-600`

**Anel SVG (% gordura):**
- Trilha de fundo: `stroke="rgba(255,255,255,0.2)"` → `stroke="rgba(0,0,0,0.1)"`
- Trilha ativa: `stroke="white"` → `stroke="#ef4444"` (vermelho-500)
- Ícone `Scale` central: `text-white` → `text-black`

**Badge de variação de peso (▼/▲ kg):**
- Container: `bg-white/20 text-white` → `bg-gray-100 text-black`
- Setas e valores delta:
  - Diminuiu: `text-green-200/100` → `text-green-600`
  - Aumentou: `text-red-200/100` → `text-red-600`
  - "estável" (Minus): preto
- Sufixo "vs. anterior": `text-white/60` → `text-gray-500`

**CTA "Ver Avaliações":**
- `bg-white/20 text-white hover:bg-white/30` → `bg-gray-100 text-black hover:bg-gray-200`

### Arquivo afetado
- `src/components/DailyAssessmentSummaryCard.tsx`

### Fora do escopo
- Mudar cores dos outros 3 cards do carrossel (calorias/hidratação/jejum permanecem com seus gradientes coloridos).
- Alterar layout, ícones ou estrutura do card.

