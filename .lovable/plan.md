

## Criar Página "Gráficos e Progresso"

Transferir os cards de Estatísticas Gerais, Balanço Calórico, Evolução Física e Gráfico de Progresso do `/profile` para uma nova página `/profile/graficos`.

### Mudanças

**1. Criar `src/pages/ChartsProgress.tsx`**
- Nova página com Navbar, mesmo layout/background do Profile
- Mover toda a lógica de dados: `loadStats`, `loadCalorieBalance`, `loadWeeklyData`, estados relacionados (`stats`, `calorieBalanceData`, `weeklyData`), TMB (`editBMR`, `bmrForm`, `showBMRCalculator`, `handleUpdateBMR`, `calculateBMR`, `handleUseBMR`)
- Incluir o componente `<PhysicalEvolutionChart />`
- Renderizar os 4 cards na ordem: Estatísticas Gerais → Balanço Calórico → Evolução Física → Gráfico de Progresso

**2. Atualizar `src/pages/Profile.tsx`**
- Remover os cards transferidos (linhas 493-773) e o `<PhysicalEvolutionChart />`
- Remover imports e estados não mais utilizados (`AreaChart`, `BarChart`, `stats`, `weeklyData`, `calorieBalanceData`, `editBMR`, `bmrForm`, etc.)
- Remover as funções `loadStats`, `loadWeeklyData`, `loadCalorieBalance`, `calculateBMR`, `handleUpdateBMR`, `handleUseBMR`

**3. Adicionar atalho em Ações Rápidas (`Profile.tsx`)**
- Adicionar um novo card no grid de Ações Rápidas com ícone `BarChart3` apontando para `/profile/graficos` com texto "Gráficos e Progresso"

**4. Registrar rota em `src/App.tsx`**
- Importar `ChartsProgress` e adicionar `<Route path="/profile/graficos" element={<ChartsProgress />} />`

