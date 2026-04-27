## Causa do problema

Nas últimas iterações do `SplashScreen.tsx` foram adicionadas, no `useEffect`:

- chamada manual de `video.load()`
- listeners em `loadedmetadata` / `canplay` / `canplaythrough` que disparam `play()` repetidamente
- manipulação de atributos (`muted`, `playsinline`, `controls`) via JavaScript depois que o React já montou o elemento

No WKWebView do iOS, o `video.load()` chamado por script **invalida o "autoplay gesture" implícito** que o `<video autoPlay muted playsInline>` ganha quando é montado pelo React. A partir daí, qualquer `play()` é tratado como "iniciado por script sem gesto do usuário" e é bloqueado, o que faz o iOS exibir o controle nativo de play sobre o primeiro frame do vídeo (exatamente o que você está vendo agora).

A versão anterior funcionava porque deixava o autoplay nativo do `<video>` agir sozinho, sem `load()` e sem reatribuir atributos via JS.

## O que vou fazer

1. **Reverter o `SplashScreen.tsx` para a abordagem simples que funcionava antes**
   - Manter o `<video>` com `autoPlay`, `muted`, `playsInline`, `preload="auto"`, `controls={false}`, `disablePictureInPicture`.
   - **Remover** a chamada `video.load()`.
   - **Remover** os listeners `loadedmetadata` / `canplay` / `canplaythrough` que chamavam `play()`.
   - **Remover** a re-aplicação de atributos via JS (`setAttribute('muted'…)`, etc.) — deixar só os atributos do JSX.
   - Manter um `play()` opcional silencioso em `onLoadedData` apenas como reforço (sem `load()` antes), pois isso não invalida o gesto.

2. **Manter o poster com o primeiro frame do vídeo**
   - Continuar usando o `poster` (primeiro frame) que já era usado, para que, mesmo enquanto o vídeo carrega, o usuário veja a imagem da splash em vez de tela preta.

3. **Manter os fallbacks de segurança que não interferem no autoplay**
   - Timer de 8s para garantir que o app não trave se o vídeo nunca tocar.
   - `onEnded` continua chamando `handleEnd` para a transição suave.

4. **Manter a correção do Live Update**
   - Continuar removendo `splashShown` do `sessionStorage` antes do `window.location.reload()` em `src/main.tsx`, para que a splash apareça depois de uma atualização OTA.

## Arquivos afetados

- `src/components/SplashScreen.tsx` — limpar o `useEffect` e voltar à configuração simples de autoplay.
- `src/main.tsx` — sem mudanças (manter como está).

Com isso o vídeo volta a iniciar sozinho, sem o botão de play do iOS, e a splash funciona como antes.