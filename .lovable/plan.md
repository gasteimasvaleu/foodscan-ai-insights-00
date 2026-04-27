## Diagnóstico

A splash screen usa um `<video>` HTML com `autoPlay muted playsInline`. Em algumas situações no iOS WebView (Capacitor), o autoplay falha silenciosamente — quando isso acontece, o iOS exibe os **controles nativos** com um botão de play, mesmo sem o atributo `controls` declarado.

Causas mais prováveis no caso atual:
1. Após o Live Update, o reload do WebView pode iniciar o React antes do "user activation gesture" estar disponível, o que em alguns casos no iOS bloqueia autoplay de mídia mesmo com `muted`.
2. O elemento `<video>` está sem `preload`, sem chamada explícita de `.play()` e sem fallback caso a Promise de `play()` rejeite.
3. Em iOS WebView, quando o autoplay falha, o sistema injeta os controles padrão como fallback — daí o "botão de play" que você está vendo.

## Correção proposta

Ajustar `src/components/SplashScreen.tsx` para forçar e garantir o autoplay no iOS:

1. **Adicionar atributos explícitos** no `<video>`:
   - `muted` real via prop + via `useEffect` setando `videoRef.current.muted = true` (alguns WebViews ignoram só o atributo JSX).
   - `autoPlay`, `playsInline`, `preload="auto"`, `disablePictureInPicture`, `controls={false}`.
   - `webkit-playsinline` (atributo legado ainda exigido por alguns WKWebView).

2. **Disparar `.play()` manualmente** num `useEffect` após o mount, com `try/catch`. Se a Promise rejeitar (autoplay bloqueado), avançar direto para o `onComplete()` em vez de deixar o usuário travado vendo um botão de play. Assim, na pior hipótese, a splash some sozinha e o app entra normalmente — sem o botão indesejado.

3. **CSS `pointer-events: none`** no `<video>` para que, mesmo se os controles aparecerem por algum motivo, o usuário não consiga interagir e o componente continue avançando pelo timer de 8s.

### Arquivo afetado

- `src/components/SplashScreen.tsx` — apenas este arquivo.

### Resultado esperado

- Splash inicia automaticamente assim que aparece (comportamento de antes). ✅
- Sem botão de play visível, mesmo se o iOS tentar exibir os controles. ✅
- Se o autoplay for bloqueado pelo sistema, a splash é pulada automaticamente em vez de travar. ✅

Sem alterações em layout, duração ou qualquer outro fluxo.