

## Corrigir erro de build: `@capacitor/app` não resolvido pelo Vite

### Problema
O `declare module` em `src/types/capacitor-app.d.ts` resolve apenas os tipos para o TypeScript, mas o **Vite** tenta resolver o import real do módulo em runtime e falha porque o pacote `@capacitor/app` não está instalado no ambiente Lovable.

### Solução
Usar **import dinâmico** (`await import(...)`) dentro do hook, apenas quando a plataforma for iOS. Assim o Vite não tenta resolver o módulo no build — ele só será carregado em runtime no dispositivo nativo.

### Alteração
- **`src/hooks/useWidgetSyncOnLaunch.ts`**: Remover o import estático `import { App as CapApp } from '@capacitor/app'` e substituir por um `import()` dinâmico dentro do `useEffect`, condicionado a `Capacitor.getPlatform() === 'ios'`. O listener do `appStateChange` será registrado com o módulo importado dinamicamente.

