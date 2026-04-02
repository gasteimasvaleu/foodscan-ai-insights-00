

## Adicionar loop infinito ao carrossel da página principal

### O que muda
O carrossel de banners + cards de resumo (calorias, hidratação, jejum) atualmente para no último slide. A alteração fará com que ele volte ao primeiro slide automaticamente após o último, criando um loop contínuo.

### Alterações em `src/components/AuthCard.tsx`

1. **Autoplay com loop** (linhas 52-65): Ao invés de parar no último slide, o `setInterval` volta para `0` quando atinge `totalSlides`:
   ```
   setCurrentBanner(prev => (prev + 1) % totalSlides)
   ```

2. **Swipe com loop** (linhas 146-155): O gesto de swipe também faz loop — swipe para frente no último slide vai para o primeiro, swipe para trás no primeiro vai para o último.

Nenhum outro arquivo precisa ser alterado.

