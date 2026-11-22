# IMC: altura em metros, validação e pedido de altura

## O que está errado (conferido na sua conta)
A sua última avaliação física, de 14/05, tem altura, mas ela foi salva como **1,70** (em metros). O campo pede altura em centímetros, e a avaliação anterior está como 170. Como o app fez a conta como se fossem 1,70 cm, o IMC saiu 242.214,5. Hoje a tela aceita qualquer número no campo de altura, sem conferir.

## O que muda
1. **Corrigir o seu registro:** a avaliação de 14/05 passa a ter altura 170 cm. Com isso, o seu IMC fica 24,2 (Normal).
2. **Aceitar altura em metros:** se alguém digitar 1,70 ou 1.70, o app entende como 170 cm, ao salvar e ao calcular. Isso vale para o IMC na Home e para a calculadora de TMB em Gráficos e Progresso.
3. **Validar a altura:** na Avaliação Física, só são aceitas alturas entre 100 e 250 cm (depois de converter de metros). Fora disso, aparece a mensagem "Informe sua altura em cm, ex.: 170".
4. **Sem altura válida, o app pede a altura:** no card de avaliação da Home, em vez do IMC aparece o botão "Informar altura", que abre a Avaliação Física. O app nunca mostra um IMC fora da faixa de 10 a 80.

## Detalhes técnicos
- Atualizar `physical_assessments.height` de `1.70` para `170` no registro `ed31fd96…`.
- Função `normalizeHeightCm(h)` em `src/lib/height.ts` (`h < 3 → h*100`; válida se entre 100 e 250, senão null). Usar em `DailyAssessmentSummaryCard.tsx`, `PhysicalAssessment.tsx` (normalizar e validar no save) e `ChartsProgress.tsx` (pré-preenchimento).
- Card: se `!height`, mostrar o botão que navega para `/profile/assessment`; esconder o IMC se `bmi` estiver fora de 10–80.
- Teste pequeno para `normalizeHeightCm` (1.70→170, 170→170, 17→null). No iPhone, a mudança chega por um Live Update.
