# Cardápio usa a mesma meta de calorias do Controle Diário

## Problema
A tela que gera o cardápio (MasterCheFIT) usa um valor próprio de calorias, salvo nas preferências dela (2.000 kcal). Ela não lê a meta do Controle Diário (3.386 kcal), por isso as duas metas aparecem diferentes.

## O que muda
- Quando a tela do cardápio abre, ela lê a sua meta de calorias do Controle Diário e usa esse valor para gerar o cardápio.
- O campo "Máximo de Calorias" mostra a meta do Controle Diário com o aviso "Meta do Controle Diário", e você não consegue mais editar o número nessa tela. Para mudar a meta, você muda no Controle Diário, e as duas telas continuam iguais.
- Se você ainda não tiver meta no Controle Diário, a tela usa 2.000 kcal e mostra um link para criar a meta.
- O cardápio antigo que já está salvo não muda. Os próximos cardápios vão usar a meta nova.

## Detalhes técnicos
- `src/pages/MasterCheFIT.tsx`: buscar `daily_goals` (último registro por `created_at`, igual ao `DailyControl.tsx`) e passar `calories` para `preferences.maxCalories`, por cima de `user_menu_preferences.max_calories`. Deixar o input somente leitura e salvar o valor sincronizado ao salvar as preferências.
- Sem mudança no banco nem nas funções do servidor. No iPhone, a mudança chega por um Live Update.
