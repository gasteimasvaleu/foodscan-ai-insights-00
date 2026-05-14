# Harmonizar proporções do card de hidratação

## Mudanças em `src/components/DailyHydrationSummaryCard.tsx`

### 1. Coluna central — texto na altura da garrafa
Aumentar tipografia para que o bloco "Hidratação do Dia / 17% / 500 / 3000 ml" ocupe verticalmente uma altura próxima à da garrafinha (~110px):
- Título: `text-[10px]` → `text-xs` (12px), mantém uppercase tracking.
- Número grande: `text-3xl` → `text-5xl` (`leading-none`).
- "%": `text-base` → `text-xl`.
- "X / Y ml": `text-[11px]` → `text-sm`, `mt-1`.
- "Meta batida!": `text-base` → `text-lg`; ícone Trophy `w-5` → `w-6`.
- Espaçamento vertical entre elementos: `mt-0.5` → `mt-1` para respirar.

### 2. Mini-chart semanal — maior e mais à esquerda
- Largura das barras: `w-[5px]` → `w-[7px]`; gap `gap-[3px]` → `gap-[4px]`.
- Altura das barras: `h-12` (48px) → `h-20` (80px) para acompanhar a altura do bloco de texto.
- Label "Semana": `text-[9px]` → `text-[10px]`.
- Iniciais dos dias: `text-[8px]` → `text-[10px]`, largura ajustada para `w-[7px]`.
- Empurrar para a esquerda: aumentar o gap da linha superior do card (`gap-2.5` → `gap-4`) e remover o padding direito implícito da coluna do chart, usando `mr-1` na coluna do meio para puxar o chart levemente para dentro. Resultado: o chart fica mais próximo do bloco de texto e mais distante da borda direita.
- Dot dourado de meta: `w-[4px] h-[4px]` → `w-[5px] h-[5px]`, posição `-top-1.5`.

### 3. Botões "+200 / +300 / +500" subindo (saindo dos dots do carrossel)
O card vive dentro de um deck (`Quick Actions`) que sobrepõe dots indicadores na base. Solução:
- Reduzir o padding inferior do wrapper externo: `py-2.5` → `pt-2.5 pb-1`.
- Reduzir margem superior dos botões: `mt-2` → `mt-1.5`.
- Diminuir levemente o padding vertical dos botões: `py-1.5` → `py-1` mantendo aparência clicável.

Resultado: a fileira de botões sobe ~12–14px, ficando claramente acima dos dots do carrossel.

### Resumo visual

```text
┌──────────────────────────────────────────────────────┐
│           Hidratação do Dia                          │
│ [Garrafa] 17%                  ▮▮▮▮▮▮▮ ←mini chart   │
│           500 / 3000 ml        S T Q Q S S D         │
│                                                      │
│       [ +200 ]  [ +300 ]  [ +500 ]                   │
│                                                      │
│   ● ● ● ●  ← dots do deck (não cobre mais)           │
└──────────────────────────────────────────────────────┘
```

Sem mudanças de dados, lógica ou backend.
