

## Adicionar opção de deletar workouts individualmente no card "Atividades de Apps Conectados"

### Contexto
Os workouts exibidos vêm do Apple HealthKit via `Health.queryWorkouts()`. Como são dados de apps externos (Strava, Garmin, etc.), o iOS não permite deletá-los do HealthKit pelo nosso app. A solução é ocultar workouts individualmente usando localStorage.

### Alterações

**1. `src/pages/AppleHealth.tsx`**
- Adicionar estado `hiddenWorkouts` (Set de strings) carregado do localStorage
- Filtrar `recentWorkouts` removendo os que estão no set de ocultos (usando `startDate` como identificador único)
- Adicionar botão de lixeira (ícone Trash2) em cada workout card com confirmação via toast ou diálogo simples
- Ao clicar, salvar o `startDate` no localStorage e remover do estado local
- Ao desconectar/reconectar o HealthKit, limpar os workouts ocultos

### Detalhes técnicos
- Chave localStorage: `healthkit_hidden_workouts`
- Identificador único de cada workout: `startDate` (suficientemente único para workouts reais)
- Botão com ícone `Trash2` posicionado à direita de cada item, com `variant="ghost"` e `size="icon"`
- Animação suave de remoção via `transition-all`

