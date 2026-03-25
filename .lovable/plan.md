

## Problema

O `capacitor.config.ts` está com `server.url` apontando para o preview do Lovable. Isso é útil apenas durante desenvolvimento (hot-reload), mas faz o app nativo carregar uma página web externa em vez de usar os arquivos locais compilados.

## Solução

**Arquivo: `capacitor.config.ts`**

Remover o bloco `server` inteiro. Assim o Capacitor carregará os arquivos locais da pasta `dist/` (definida em `webDir`), funcionando como app nativo offline.

```ts
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.dietainteligente',
  appName: 'We Diet',
  webDir: 'dist',
  backgroundColor: '#ff2d9e',
  ios: {
    backgroundColor: '#ff2d9e',
  },
};

export default config;
```

## Após a mudança

1. `git pull` no projeto local
2. `npm run build` para gerar a pasta `dist/`
3. `npx cap sync ios` para sincronizar
4. Rodar no Xcode novamente

> **Nota**: Quando quiser voltar ao modo de desenvolvimento com hot-reload, basta re-adicionar o bloco `server` temporariamente.

