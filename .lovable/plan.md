

## Card de Resumo Calórico no Carrossel de Banners

### O que muda
O carrossel de banners na página principal (`AuthCard.tsx`) ganha suporte a swipe manual, reduz o autoplay de 10s para 5s, e adiciona um card final de resumo calórico do dia (similar ao screenshot) após o último banner.

### Como funciona
1. **Carrossel com swipe** — Adicionar gesture de arrastar (touch events) para navegar entre slides
2. **Autoplay 5s** — Alterar o intervalo de 10000ms para 5000ms
3. **Slide extra no final** — Após o último banner, exibir um card com:
   - Calorias restantes (meta - consumidas) à esquerda
   - Anel circular central com ícone de fogo (calorias gastas/exercício)
   - Calorias totais consumidas à direita
   - 3 barras de progresso embaixo: Carboidratos, Proteínas, Gorduras
   - Seta/botão para ir ao Controle Diário
4. **Dados** — Buscar `daily_goals` e `meal_records` do dia atual no Supabase, reutilizando a mesma lógica de `DailyControl.tsx`
5. **Indicadores** — Os dots do carrossel incluem o slide extra

### Arquivos afetados
- **`src/components/AuthCard.tsx`** — Lógica de swipe, autoplay 5s, slide extra, fetch de dados diários
- Potencialmente extrair o card de resumo para um componente separado (`src/components/DailyCalorieSummaryCard.tsx`) para manter o AuthCard limpo

### Detalhes técnicos
- Touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd` com threshold de ~50px para detectar swipe
- O total de "slides" passa a ser `bannerImages.length + 1`; quando `currentBanner === bannerImages.length`, renderiza o card de resumo em vez de imagem
- O card de resumo usa o mesmo `aspect-video` para manter proporção consistente
- Anel circular via SVG com `stroke-dasharray` proporcional às calorias consumidas/meta
- Busca de dados: `daily_goals` (última meta) + `meal_records` do dia + `hydration_records` do dia, mesma query do DailyControl
- Se o usuário não tiver metas cadastradas, o card mostra um CTA para configurar metas

