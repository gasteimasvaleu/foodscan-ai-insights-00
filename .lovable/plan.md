Vou ajustar a correção anterior porque ela resolveu o botão de play, mas introduziu um efeito colateral: quando o `video.play()` é bloqueado ou dispara cedo demais no iOS WebView, a splash chama `onComplete()` imediatamente e some antes da animação rodar.

Plano de correção:

1. Alterar `src/components/SplashScreen.tsx`
   - Remover o comportamento atual que pula a splash automaticamente quando o autoplay falha.
   - Manter o vídeo sem controles, mudo e inline para evitar o botão de play nativo.
   - Adicionar uma rotina de reprodução mais resiliente:
     - configurar `muted/defaultMuted/playsinline/webkit-playsinline` antes de tentar tocar;
     - chamar `load()` quando necessário;
     - tentar `play()` no mount;
     - tentar novamente em eventos como `loadedmetadata`, `canplay` e `canplaythrough`.
   - Manter o fallback de 8 segundos apenas como segurança para não travar o app, mas sem encerrar imediatamente por falha de autoplay.

2. Ajustar a interação visual da splash
   - Continuar bloqueando controles e interação no vídeo para não aparecer botão de play.
   - Se o iOS atrasar o autoplay por alguns milissegundos, a tela permanece na splash até o vídeo conseguir iniciar ou até o fallback de tempo.

3. Ajustar Live Update em `src/main.tsx`
   - Antes de executar `window.location.reload()` após um novo bundle OTA, limpar `sessionStorage.removeItem('splashShown')`.
   - Isso garante que, depois de Live Update, a splash seja exibida novamente corretamente no próximo carregamento.

Resultado esperado:
- A splash aparece.
- O botão de play não aparece.
- A animação tenta iniciar automaticamente de forma mais confiável no iOS.
- Se o autoplay falhar momentaneamente, ela não é pulada imediatamente.
- Depois de Live Update, o app volta a mostrar a splash no novo bundle.