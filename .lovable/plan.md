

## Remover cards "Meu Perfil" e "Ver Treinos"

Manter apenas 4 cards na ordem: Escanear Comida, Registrar Exercício, Gerar Cardápio, WhatsApp.

### Alteração em `src/components/QuickActions.tsx`

- Remover o item "Meu Perfil" (linhas 13-18) e "Ver Treinos" (linhas 34-39) do array `actions`
- Remover imports não utilizados: `User`, `Dumbbell`

