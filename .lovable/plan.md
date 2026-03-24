

## Adicionar padding inferior em todas as páginas

O menu Tubelight fixo no rodapé (+ faixa branca decorativa) ocupa ~80px. Várias páginas não têm padding inferior suficiente, fazendo o conteúdo ficar escondido atrás do menu.

### Solução

Adicionar `pb-28` (112px) nas divs principais de conteúdo de todas as páginas que não têm padding inferior adequado. Páginas que já têm `pb-24` ou `pb-28` ficam como estão.

### Páginas a alterar

| Página | Situação atual | Ação |
|--------|---------------|------|
| **Index.tsx** | `pb-12` | → `pb-28` |
| **About.tsx** | `pb-12` | → `pb-28` |
| **Auth.tsx** | `pb-12` | → `pb-28` |
| **Subscription.tsx** | `pb-12` | → `pb-28` |
| **FoodScan.tsx** | sem pb | → adicionar `pb-28` |
| **FitTracker.tsx** | sem pb | → adicionar `pb-28` |
| **DailyControl.tsx** | sem pb | → adicionar `pb-28` |
| **MasterCheFIT.tsx** | sem pb | → adicionar `pb-28` |
| **Treinos.tsx** | sem pb | → adicionar `pb-28` |
| **WhatsAppSettings.tsx** | sem pb | → adicionar `pb-28` |
| **PaymentSuccess.tsx** | sem pb | → adicionar `pb-28` |
| **PaymentCancel.tsx** | sem pb | → adicionar `pb-28` |
| **AdminTreinos.tsx** | sem pb | → adicionar `pb-28` |
| **AdminNotifications.tsx** | sem pb | → adicionar `pb-28` |
| **PhysicalAssessment.tsx** | sem pb | → adicionar `pb-28` |

### Páginas que já estão OK (não alterar)
- **Profile.tsx** — já tem `pb-28`
- **ServiNUTRI.tsx** — já tem `pb-28`
- **WorkoutPlan.tsx** — já tem `pb-24`
- **MyDiets.tsx** — já tem `pb-24`

### Detalhes técnicos
Em cada página, localizar a div principal de conteúdo (geralmente a que tem `min-h-screen`) e adicionar ou atualizar a classe `pb-28`. Nos estados de loading e não-autenticado também será adicionado o padding para consistência.

