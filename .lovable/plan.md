

## Corrigir erro de build: `@capacitor/app` não encontrado

### Problema
O arquivo `src/hooks/useWidgetSyncOnLaunch.ts` importa `@capacitor/app`, que só existe no ambiente nativo (Xcode). No Lovable, o pacote não está instalado, causando erro de build.

### Solução
Criar um arquivo de declaração de tipos (`src/types/capacitor-app.d.ts`) com `declare module '@capacitor/app'` que exporta os tipos mínimos usados pelo hook. Isso permite que o TypeScript compile sem erro, enquanto no dispositivo o módulo real é usado.

### Alteração
- **Novo arquivo `src/types/capacitor-app.d.ts`**: declara o módulo `@capacitor/app` com os tipos `App` (método `addListener`) e `AppState` usados no hook.

