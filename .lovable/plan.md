

## Adicionar card de Jejum Intermitente no carrossel da página principal

### O que será feito
Criar um novo componente `DailyFastingSummaryCard` (seguindo o padrão dos cards de calorias e hidratação) e adicioná-lo ao carrossel do `AuthCard`, como terceiro slide após o card de hidratação.

### Alterações

**1. Criar `src/components/DailyFastingSummaryCard.tsx`**
- Seguir o mesmo padrão visual do `DailyHydrationSummaryCard`
- Gradiente roxo/violeta para diferenciar visualmente (ex: `from-purple-500 via-violet-500 to-indigo-600`)
- Buscar do Supabase (`fasting_records`) o jejum ativo do usuário ou o último completado hoje
- Exibir: status (em jejum / não jejum), tempo decorrido ou último jejum, ring de progresso com porcentagem vs `target_hours`
- Botão CTA "Ver Jejum" que navega para `/intermittent-fasting`
- Ícone: `Timer` do lucide-react

**2. Editar `src/components/AuthCard.tsx`**
- Importar `DailyFastingSummaryCard`
- Alterar `totalSlides` de `banners.length + 2` para `banners.length + 3` (linhas 54 e 136)
- Adicionar o slide do jejum após o de hidratação (índice `bannerImages.length + 2`)

