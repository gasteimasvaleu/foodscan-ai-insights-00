

## Card de Progresso de Hidratação no Carrossel

### O que muda
Adicionar um novo slide ao carrossel de banners, após o card de resumo calórico, mostrando o progresso de hidratação do dia.

### Implementação

1. **Criar `src/components/DailyHydrationSummaryCard.tsx`**
   - Mesmo padrão visual do `DailyCalorieSummaryCard` (gradiente rosa, `aspect-video`, clicável)
   - Busca `profiles.hydration_goal_ml` e `hydration_records` do dia atual
   - Exibe:
     - Ícone de gota d'água central com anel circular SVG (progresso ml consumidos / meta)
     - ml consumidos vs meta à esquerda e direita
     - Barra de progresso percentual embaixo
     - CTA "Ver Hidratação" que navega para `/hidratacao`
   - Se não houver meta, CTA para configurar

2. **Atualizar `src/components/AuthCard.tsx`**
   - Importar `DailyHydrationSummaryCard`
   - Mudar `totalSlides` de `bannerImages.length + 1` para `bannerImages.length + 2`
   - Adicionar o slide de hidratação em `currentBanner === bannerImages.length + 1`
   - O autoplay para no último slide (hidratação)
   - Dots e swipe já funcionam automaticamente com o novo `totalSlides`

### Ordem dos slides
```text
[Banner 1] → [Banner 2] → ... → [Resumo Calórico] → [Hidratação]
```

### Arquivos
- **Criar**: `src/components/DailyHydrationSummaryCard.tsx`
- **Editar**: `src/components/AuthCard.tsx`

