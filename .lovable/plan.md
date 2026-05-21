## Diagnóstico

Erro 153 acontece porque, no iOS nativo (Capacitor/WKWebView), o app é servido de `capacitor://localhost`. Quando o iframe do YouTube é embedado direto, ele lê esse origin/referrer e bloqueia o playback (sobretudo de playlists e clipes musicais). Não tem combinação de parâmetros (`playsinline`, `rel`, `origin=…`) que conserte isso quando o origin é `capacitor://`.

## Solução: iframe-em-iframe via página intermediária no nosso domínio

Em vez de abrir o YouTube no navegador externo, vamos servir uma página HTML estática no **nosso próprio domínio HTTPS** (`https://app.dietainteligente.app/youtube-embed.html`) que contém o iframe do YouTube. O YouTubePlayer no app carrega essa página como iframe.

Resultado: o iframe interno do YouTube enxerga como página-pai um documento servido de `https://app.dietainteligente.app` (origin válido e já autorizado), e o playback funciona normalmente — **tudo dentro do app**, sem abrir Safari nem app externo.

```text
[App WKWebView (capacitor://localhost)]
  └── <iframe src="https://app.dietainteligente.app/youtube-embed.html?...">
        └── <iframe src="https://www.youtube.com/embed/..."> ← parent agora é nosso domínio
```

## Mudanças

### 1. Novo arquivo `public/youtube-embed.html`
Página minimalista, fundo preto, ocupando 100% do viewport, que lê `?id=…&type=video|playlist&autoplay=1` da URL e monta o iframe do YouTube com:
- `playsinline=1`, `rel=0`, `autoplay=1`
- `origin=https://app.dietainteligente.app`
- `allow="autoplay; encrypted-media; picture-in-picture"`
- `allowfullscreen`

Como fica em `public/`, vai automaticamente servida em `https://app.dietainteligente.app/youtube-embed.html` (e também em web/preview, sem problema).

### 2. `src/components/musicas/YouTubePlayer.tsx`
- Detectar `isIOS && isNative` via `useNativePlatform()`.
- **iOS nativo**: `src = "https://app.dietainteligente.app/youtube-embed.html?id=…&type=…&autoplay=1"`.
- **Web/Android**: manter URL atual `https://www.youtube.com/embed/...` (já funciona).
- O resto do componente (`aspect-video`, `rounded-2xl`, allow flags) fica igual.

### 3. Sem mudanças em `VinylPlayer.tsx`, sem `@capacitor/browser`, sem nada externo
O fluxo do disco continua: clica → toca inline → mostra iframe. Só muda a URL de origem no iOS nativo.

## Plano B (se mesmo assim falhar em alguma playlist)

Algumas playlists têm `embed disabled` no próprio YouTube — nesses casos, nem essa técnica resolve, porque é restrição do dono do vídeo. Para esses, adicionar tratamento de erro do IFrame API (postMessage `onError`) e mostrar dentro do mesmo card um botão "Tocar mesmo assim" que aí sim cai pro `@capacitor/browser`. Não implementamos agora — só se aparecer.

## Detalhes técnicos

- O arquivo `public/youtube-embed.html` é servido pelo Vite em dev e copiado pro `dist/` em build, então fica disponível tanto no preview Lovable quanto na build de produção que vira o app. O domínio precisa ser o **publicado** (`app.dietainteligente.app`), porque o build do iOS aponta pra ele.
- Não mexer no `capacitor.config.ts` trocando `server.hostname`/`iosScheme` — isso quebraria sessão do Supabase, OAuth, RevenueCat e widget compartilhado, que dependem do origin atual.
- `allowsInlineMediaPlayback: true` e `mediaTypesRequiringUserActionForPlayback: 'none'` já estão configurados no `capacitor.config.ts`, então o autoplay vai funcionar.
