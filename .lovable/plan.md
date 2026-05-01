## Problema

O controle de play nativo do WKWebView ainda aparece sobre o splash no app iOS instalado, mesmo com o vídeo bundlado localmente.

**Causa raiz:** o `capacitor.config.ts` não habilita inline media playback no WKWebView. Sem essas duas flags, o iOS:

1. Ignora o atributo `playsInline` do `<video>` e força fullscreen com controles.
2. Exige gesto do usuário pra dar play, bloqueando o autoplay e desenhando o controle nativo sobre o primeiro frame.

Como o controle aparece **antes** do React rodar `onLoadedData`/`onError`, o nosso fallback `videoFailed` nunca dispara a tempo.

## Mudanças

### 1. Habilitar inline playback no WKWebView (correção principal)

Editar `capacitor.config.ts` adicionando ao bloco `ios`:

```ts
ios: {
  backgroundColor: '#ff2d9e',
  packageManager: 'cocoapods',
  allowsInlineMediaPlayback: true,
  mediaTypesRequiringUserActionForPlayback: 'none',
},
```

Isso faz o WKWebView respeitar `playsInline` e permitir autoplay sem gesto — eliminando o controle nativo na origem.

### 2. Defesa em profundidade: pular o vídeo direto pra imagem no iOS nativo

Mesmo com a config certa, alguns cenários de iOS (Low Power Mode, primeira execução pós-instalação) ainda podem bloquear autoplay. Pra garantir que o controle de play nunca apareça, atualizar `src/components/SplashScreen.tsx`:

- Detectar plataforma nativa iOS via `useNativePlatform`.
- Se `isNative && isIOS`, inicializar `videoFailed = true` direto no `useState`, pulando o `<video>` completamente e mostrando só `/splash-frame.png` (idêntica à LaunchScreen nativa, então a transição é invisível).
- Web/PWA continua tentando o vídeo normalmente.

A imagem estática + LaunchScreen nativa idêntica = experiência visualmente equivalente ao vídeo nos primeiros ~2.5s, sem risco de aparecer controle.

### 3. Sincronização

Após o merge:
- `git pull`
- `npm run cap:sync` (usa o wrapper `scripts/cap-sync.sh` que preserva o widget e plugins nativos)
- Rebuild no Xcode/Appflow — necessário porque `capacitor.config.ts` afeta o `WKWebViewConfiguration` nativo, que só é regenerado em build novo (Live Update sozinho não resolve essa parte).

## O que NÃO muda

- `LaunchScreen.storyboard` e assets nativos.
- `public/splashrosa.mp4` continua bundlado (serve PWA/web).
- Lógica de `showSplash` em `Index.tsx`.
- Memória `mem://features/ui/splash-screen` será atualizada após implementação pra registrar a config WKWebView e o skip no iOS nativo.
