

## Problema: Live Updates não está funcionando

O plugin `@capacitor/live-updates` está configurado no `capacitor.config.ts`, mas **nenhum código no app chama o sync do Live Updates**. A configuração sozinha não basta — é necessário chamar `LiveUpdates.sync()` programaticamente para que o app verifique e aplique atualizações OTA.

Com `autoUpdateMethod: 'background'`, o plugin tenta sincronizar automaticamente, mas ainda precisa ser **inicializado** no código da aplicação.

---

## Plano

### 1. Adicionar inicialização do Live Updates no `src/main.tsx`

Importar `LiveUpdates` de `@capacitor/live-updates` e `Capacitor` de `@capacitor/core`. Ao iniciar o app, se estiver em plataforma nativa, chamar `LiveUpdates.sync()` para verificar atualizações. Também adicionar um listener de `resume` (app voltando do background) para re-sincronizar.

```typescript
import { Capacitor } from '@capacitor/core';
import { LiveUpdates } from '@capacitor/live-updates';
import { App as CapApp } from '@capacitor/app';

if (Capacitor.isNativePlatform()) {
  LiveUpdates.sync().then(result => {
    if (result.activeApplicationPathChanged) {
      window.location.reload();
    }
  });

  CapApp.addListener('resume', async () => {
    const result = await LiveUpdates.sync();
    if (result.activeApplicationPathChanged) {
      window.location.reload();
    }
  });
}
```

### 2. Instalar `@capacitor/app` (se ainda não instalado)

O pacote `@capacitor/app` é necessário para escutar o evento `resume`. Verificar se já está no `package.json`; caso contrário, adicioná-lo.

---

## Resultado esperado

- Ao abrir o app nativo, ele verifica se há uma nova versão OTA disponível
- Ao voltar do background, verifica novamente
- Se houver atualização, recarrega o app automaticamente com a nova versão

