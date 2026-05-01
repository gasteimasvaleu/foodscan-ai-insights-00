## Causa raiz

O simulador iOS é permissivo com autoplay; o device real **não é**. Mesmo com `allowsInlineMediaPlayback: true` e `mediaTypesRequiringUserActionForPlayback: 'none'` no `capacitor.config.ts`, o iOS real ainda pode mostrar o botão de play em três cenários:

1. **Low Power Mode** ativo → policy do SO bloqueia autoplay independente da config do WebView.
2. **Primeiro launch pós-instalação** → o `<video>` monta antes da config WKWebView ser aplicada.
3. **Build em cache** no Xcode rodando JS antigo sem o skip de iOS.

A defesa que implementamos antes (`videoFailed = isNativeIOS` no `useState` inicial) só funciona se `Capacitor.isNativePlatform()` retornar `true` **no primeiro render**. Se houver qualquer atraso no bootstrap do Capacitor, cai no branch do `<video>` por 1 frame — tempo suficiente pro WKWebView desenhar o controle de play.

## Mudanças

### 1. Detecção síncrona e blindada de iOS nativo (`src/components/SplashScreen.tsx`)

Trocar a checagem que depende do hook por uma **detecção dupla**, executada de forma síncrona antes do primeiro render:

```ts
const isNativeIOSEnv = (() => {
  try {
    // Capacitor 8 expõe isNativePlatform sincronamente
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') return true;
  } catch {}
  // Fallback: detectar standalone iOS via UA quando Capacitor não responder
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isStandalone = (window.navigator as any).standalone === true;
  // Se está empacotado como app iOS (standalone + UA iOS), trata como nativo
  return isIOSDevice && isStandalone;
})();

const [videoFailed, setVideoFailed] = useState(isNativeIOSEnv);
```

Isso garante que **mesmo se o Capacitor demorar a inicializar**, o splash já entra no branch da imagem estática.

### 2. Remover completamente o `<video>` do DOM no iOS nativo

Hoje o JSX renderiza condicionalmente, mas o React ainda monta o componente `<video>` se `videoFailed` virar `true` depois. Trocar por um early-return que **nunca** insere a tag `<video>` na árvore se for iOS nativo:

```tsx
if (isNativeIOSEnv) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div /* ... */>
          <img src="/splash-frame.png" alt="" className="w-full h-full object-cover" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// Web/PWA segue com a lógica de <video> + fallback
```

Sem `<video>` no DOM = sem possibilidade de o WKWebView desenhar controle de play. Ponto final.

### 3. Diagnóstico: log de plataforma no boot

Adicionar um `console.log('[SplashScreen] platform:', Capacitor.getPlatform(), 'isNative:', Capacitor.isNativePlatform())` no início do componente. Quando você abrir o app no device, esse log aparece nos logs do Safari Web Inspector conectado ao iPhone — confirma se o Capacitor está sendo detectado corretamente.

### 4. Documentação

Atualizar `mem://features/ui/splash-screen` registrando a detecção dupla (Capacitor + UA fallback) e o early-return que nunca monta `<video>` no iOS nativo.

## O que NÃO muda

- `capacitor.config.ts` — as flags do WKWebView continuam corretas e ajudam Web/PWA + Android.
- `LaunchScreen.storyboard` — a transição visual continua imperceptível porque a `splash-frame.png` é idêntica ao `Splash.imageset`.
- `public/splashrosa.mp4` — segue bundlado para Web/PWA.

## Próximos passos para você

Após aprovar e eu aplicar as mudanças:

1. `git pull`
2. `npm run build` ← **importante**, sem isso o `cap:sync` copia JS velho
3. `npm run cap:sync`
4. No Xcode: **Product → Clean Build Folder** (Shift+Cmd+K), depois **Run** no device real
5. Conecte o iPhone ao Safari → Develop → [seu iPhone] → We Diet → procure pelo log `[SplashScreen] platform: ios isNative: true`

Se o log mostrar `platform: web isNative: false`, sabemos que o problema é bootstrap do Capacitor e o fallback por UA vai cobrir.
