

## Mostrar Tubelight menu na página NutriCoach

### Problema
O Tubelight menu já é renderizado globalmente pelo `AuthAwareNavbar` no App.tsx, mas o input fixo do NutriCoach tem `z-50` (maior que o `z-40` do Tubelight), cobrindo o menu com seu fundo branco.

### Mudança

**`src/pages/NutriCoach.tsx`** — Ajustar o z-index e posicionamento do input para ficar **acima** do Tubelight sem cobri-lo:
- Mudar o input container de `z-50` para `z-30` (abaixo do Tubelight `z-40`)
- Aumentar o `bottom` do input para que fique logo acima do Tubelight menu (~bottom-20)
- Ajustar o `pb` da área de mensagens para compensar o espaço total (input + tubelight)

Resultado: o input fica posicionado entre as mensagens e o Tubelight menu, sem sobrepor nenhum dos dois.

