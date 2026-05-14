## Reposicionar botão "Voltar aos 14 dias"

Mover o botão de voltar para a mesma linha do título "Dia X", alinhado à direita, com o "Dia X" do mesmo tamanho do botão.

### Mudanças em `src/pages/Desafio14Dias.tsx`

1. **Remover o botão da página inline (linhas 265-271)** — não fica mais acima do card.

2. **Atualizar o cabeçalho do `DayView` (linhas 524-530)** para layout em duas colunas:
   - Coluna esquerda: `Dia {day}` (mesmo `text-sm font-semibold text-[#FD46A1]` do botão, em vez do `text-xs`) + título + resumo.
   - Coluna direita: botão "Voltar aos 14 dias" (`ArrowLeft` + texto), alinhado ao topo-direita, mesma cor pink.

3. **Passar `onClose` como prop usada para o botão** (já existe, hoje fecha a página inline) — o botão dentro do `DayView` chamará `onClose()`.

Resultado: em todos os 14 dias, o cabeçalho do card fica `Dia X` à esquerda e `← Voltar aos 14 dias` à direita, ambos no mesmo tamanho de fonte.
