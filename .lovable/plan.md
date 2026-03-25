

## Configurar cores nativas iOS para splash e safe area

### Mudanças

**1. `capacitor.config.ts`** — Adicionar configuração de background color do iOS
- Adicionar `backgroundColor: '#ff2d9e'` para que o WebView inicie com fundo rosa em vez de preto
- Adicionar `ios.backgroundColor: '#ff2d9e'` para a splash nativa

**2. `index.html`** — Ajustar meta tags de cor
- Alterar `theme-color` de `#6C63FF` para `#FD46A1` (controla a cor da status bar/safe area em dispositivos reais)
- Alterar `apple-mobile-web-app-status-bar-style` de `default` para `black-translucent` (permite que o background do app preencha a safe area)

**3. `src/index.css`** — Garantir background rosa na safe area
- Adicionar `background-color: #FD46A1` ao `body` no modo standalone, para que as áreas seguras (notch, barra inferior) fiquem na cor certa em vez de preto

**4. `public/manifest.json`** — Atualizar `theme_color` e `background_color`
- Trocar ambos de `#6C63FF`/`#ffffff` para `#FD46A1` e `#ff2d9e` respectivamente

### Nota para o dev
Após o pull, rodar `npx cap sync ios` e reabrir o Xcode. A cor de fundo da LaunchScreen no Xcode pode precisar de ajuste manual no storyboard se quiser controle total sobre a splash nativa do iOS.

