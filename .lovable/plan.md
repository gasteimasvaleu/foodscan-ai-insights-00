# Subir botões acima dos dots e empurrar mini-chart à esquerda

Os dots do carrossel ficam em `bottom-2` (dentro do `AuthCard.tsx`, z-20). Para os botões `+200/+300/+500` saírem de baixo deles, basta reservar espaço inferior dentro do próprio card de hidratação.

## Mudanças em `src/components/DailyHydrationSummaryCard.tsx`

1. **Botões acima dos dots**
   - Wrapper externo: `pt-2.5 pb-1` → `pt-2.5 pb-5` (reserva ~16px abaixo dos botões para ficarem acima dos dots em `bottom-2`).
   - Linha dos botões: manter `mt-1.5`, mas garantir `relative z-10` para ficar acima dos dots se houver sobreposição residual.

2. **Mini-chart mais à esquerda**
   - Linha superior: `gap-4` → `gap-6` (afasta chart do bloco de texto e o puxa para dentro do card).
   - Coluna do meio: `mr-1` → `mr-3` (reduz o flex-1 do meio, deslocando o chart à esquerda).
   - Coluna do chart ganha `mr-2` para também afastar levemente da borda direita, garantindo que o chart fique mais centralizado/à esquerda em relação à borda.

Sem mudanças de dados ou comportamento.
