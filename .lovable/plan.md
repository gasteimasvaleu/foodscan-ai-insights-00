## Objetivo

Adicionar o spinner SVG animado (`loader-15`, gradiente rosa→laranja) sobre o `splash-frame.png` no splash iOS nativo, **posicionado abaixo da logo** (não no centro), pra não cobrir o logotipo da imagem nativa.

## Escopo

- **Onde aparece:** sobre `splash-frame.png` no branch `NativeIOSSplash` de `src/components/SplashScreen.tsx`.
- **Onde NÃO aparece:** `LaunchScreen.storyboard` (continua imagem estática pura) e `WebSplash` (mantém vídeo/fallback como está).

## Posicionamento

- `position: absolute`, centralizado horizontalmente (`left-1/2 -translate-x-1/2`).
- Verticalmente: **~70% da altura da tela** (`top-[70%]`), bem abaixo da logo centralizada do splash.
- Tamanho: ~64px (escalando o SVG 200×200 do snippet via `width/height`).
- Respeita safe area inferior pra não colidir com home indicator.

## Decisões técnicas

1. **NÃO instalar `styled-components`** — projeto é Tailwind puro. Vou portar o snippet pra React + CSS-in-JSX com `<style>` inline contendo os `@keyframes Snurra1` e classes (`.halvan`, `.strecken`, `.skugga`, gradient stops). SVG (linearGradient + filter blur) fica idêntico ao original.
2. **Arquivo novo:** `src/components/ui/loader-15.tsx` — componente `<Loader />` default, sem props, aceita opcionalmente `className` pra controlar tamanho/posição.
3. **Integração:** importar `Loader` em `SplashScreen.tsx` e renderizar dentro do `<motion.div>` do `NativeIOSSplash`, depois do `<img>`, com classes de posicionamento absolute.

## Arquivos afetados

- **Novo:** `src/components/ui/loader-15.tsx`
- **Editar:** `src/components/SplashScreen.tsx` (apenas o branch `NativeIOSSplash`)

## Não vou fazer

- Não instalar `styled-components`.
- Não mexer no `LaunchScreen.storyboard` nem em arquivos iOS nativos.
- Não alterar timers, `handleEnd` ou lógica de detecção de plataforma.
- Não adicionar o spinner no `WebSplash`.
