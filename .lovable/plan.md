

## Plano: Corrigir sincronização do Widget iOS com dados reais

### Problemas identificados

1. **Hidratação em ml não é passada ao widget** — `useWidgetSync` recebe `hydrationMl=0` por padrão, mas o DailyControl não busca nem passa o valor real de ml consumidos e a meta de hidratação
2. **Sync só ocorre no Controle Diário** — se o usuário não abre essa tela, o widget mantém dados antigos
3. **Sem reset diário** — dados do dia anterior permanecem no widget

### Solução

#### 1. Passar dados de hidratação reais no DailyControl (`src/pages/DailyControl.tsx`)

- Buscar `hydration_goal_ml` do perfil e somar `hydration_impact_ml` dos registros do dia
- Passar `hydrationMl` e `hydrationTarget` reais ao `useWidgetSync`

#### 2. Criar sync global no App.tsx (`src/App.tsx`)

- Adicionar um hook `useWidgetSyncOnLaunch` que roda ao abrir o app (em iOS):
  - Busca metas, refeições e hidratação do dia atual no Supabase
  - Chama `SharedData.saveWidgetData` com os dados atualizados
  - Garante que mesmo sem abrir o Controle Diário, o widget reflita os dados corretos

#### 3. Novo hook: `src/hooks/useWidgetSyncOnLaunch.ts`

- Executa apenas em iOS e com usuário autenticado
- Busca do Supabase em paralelo: `daily_goals`, `meal_records` (do dia), `hydration_records` (do dia), `profiles.hydration_goal_ml`
- Calcula totais e chama `SharedData.saveWidgetData`
- Roda uma vez ao montar o App (e quando o app volta do background via `appStateChange`)

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useWidgetSyncOnLaunch.ts` | Novo — sync completo ao abrir o app |
| `src/pages/DailyControl.tsx` | Passar `hydrationMl` e `hydrationTarget` reais ao hook |
| `src/App.tsx` | Chamar `useWidgetSyncOnLaunch` no componente raiz |

