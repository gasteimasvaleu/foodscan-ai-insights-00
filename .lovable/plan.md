# Ajuste de layout do card de Avaliação Física

Corrigir a distribuição: título/badge colados na borda, coluna do peso com espaço vazio quando não há sparkline, e ring/IMC pouco respiráveis.

## Alterações em `DailyAssessmentSummaryCard.tsx`

1. **Padding externo**
   - Wrapper: `px-3` → `px-4` (mais respiro lateral pro título e pro chip "há Xd").

2. **Header**
   - Manter título centralizado, mas reduzir o tamanho do chip para `text-[9px] px-1.5 py-0.5` para não dominar.
   - Adicionar `mb-2` consistente.

3. **Hero — redistribuir em 3 zonas com `justify-between`**
   ```text
   ┌─────────────────────────────────────────────┐
   │ 65,0 kg            ╭──╮      ┌──────────┐  │
   │ ↓ 0,8 kg / sem cmp │12│  +   │  Normal  │  │
   │ (sparkline)        │BG│      │   22,5   │  │
   │                    ╰──╯      └──────────┘  │
   └─────────────────────────────────────────────┘
   ```
   - Trocar `flex items-center gap-3 flex-1` por `flex items-center justify-between gap-2 flex-1`.
   - Coluna peso: `flex-1 min-w-0` (sem encolher exagerado).
   - Ring + Chip IMC: `flex items-center gap-2 shrink-0`.

4. **Sparkline sempre ocupando linha (placeholder)**
   - Quando `sparkValues.length < 2`: renderizar um placeholder `<div className="h-[28px] flex items-center"><span className="text-white/40 text-[10px]">Sem histórico ainda</span></div>` para evitar que a coluna do peso "encurte" e crie o vazio.
   - Quando há sparkline, segue como está mas com `text-white/50 text-[9px] mt-0.5` indicando "últimos {n} dias" abaixo.

5. **Ring %BG**
   - Aumentar levemente: 62×62 → 64×64, `radius` 26 → 28. Mantém peso visual.

6. **Chip IMC**
   - `px-2 py-1.5` → `px-2.5 py-2`, `rounded-2xl`. Centralizar com `min-w-[56px]`.
   - Hierarquia: label em cima `text-[9px]` / número grande `text-lg` / "IMC" `text-[9px]`.

7. **Sem comparativo / delta**
   - Quando não há `delta`, manter "sem comparativo" mas em `text-white/40` para ficar mais discreto.

## Fora de escopo

- Não muda dados nem fluxo do botão "Registrar peso".
- Não toca no estado vazio nem no Dialog.
