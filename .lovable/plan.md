

## Por que as atualizações JS Web do AppFlow não chegam no app

O app **não tem o plugin de Live Updates do Capacitor instalado**. Sem ele, o app nativo sempre carrega os arquivos web que foram empacotados no build original — ele não sabe buscar atualizações OTA do AppFlow.

### O que precisa ser feito

**1. Instalar o plugin `@capawesome/capacitor-live-update`** (ou o oficial `@capacitor/live-updates` do Appflow)

No `package.json`, adicionar a dependência do plugin de Live Updates compatível com o Appflow.

**2. Configurar o plugin no `capacitor.config.ts`**

Adicionar a configuração do Live Updates com o App ID do Appflow e o canal (channel) desejado (ex: `Production`):

```ts
plugins: {
  LiveUpdates: {
    appId: 'f4605189',
    channel: 'Production',
    autoUpdateMethod: 'background',
  },
},
```

**3. Desativar o Service Worker no contexto nativo**

O `sw.js` atual usa estratégia cache-first, o que **bloqueia atualizações** mesmo que o Live Update baixe novos arquivos. No contexto nativo (Capacitor), o service worker deve ser desabilitado ou usar estratégia network-first.

No `src/main.tsx` (ou onde o SW é registrado), adicionar uma verificação:

```ts
if (!Capacitor.isNativePlatform()) {
  // registrar service worker apenas na web
}
```

**4. Rebuild nativo necessário (uma única vez)**

Após essas alterações, será necessário fazer um novo build nativo no AppFlow e enviar para a App Store. A partir daí, futuras atualizações JS Web chegarão via OTA sem precisar de novo build nativo.

### Resumo das alterações

| Arquivo | Alteração |
|---|---|
| `package.json` | Adicionar `@capacitor/live-updates` |
| `capacitor.config.ts` | Configurar plugin LiveUpdates |
| `src/main.tsx` | Condicionar registro do SW ao contexto web |

