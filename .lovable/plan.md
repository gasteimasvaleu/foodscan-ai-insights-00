

## Plano: Mostrar PWAInstallPrompt apenas na plataforma web

### Problema
O toast de instalação PWA aparece também quando o app roda como nativo (iOS/Android via Capacitor), onde não faz sentido.

### Solução
No `PWAInstallPrompt.tsx`, importar `Capacitor` de `@capacitor/core` e adicionar um early return no início do componente quando `Capacitor.isNativePlatform()` retornar `true`.

### Alteração em `src/components/PWAInstallPrompt.tsx`:
- Adicionar `import { Capacitor } from '@capacitor/core';` no topo
- Antes de qualquer lógica/useEffect, adicionar:
  ```tsx
  const isNative = Capacitor.isNativePlatform();
  if (isNative) return null;
  ```

