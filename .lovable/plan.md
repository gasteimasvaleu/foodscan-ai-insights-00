
Problema real: o toque no botão provavelmente está funcionando, mas o app aberto pelo Xcode não está executando o código web mais recente. O indício forte é o log nativo:

```text
[LiveUpdates] Sync result ... source:"cache"
snapshot ... buildId:"10831298"
```

Enquanto isso, os logs `[HealthKit]` adicionados em `src/hooks/useHealthKit.ts` nunca aparecem. Como o texto do botão muda para “Conectando...”, o `handleConnect` de `src/components/HealthKitConnect.tsx` está rodando. Então o mais provável é:

1. o app em iOS está carregando um snapshot OTA em cache via `@capacitor/live-updates`, não o bundle novo;
2. por isso você vê uma versão antiga do hook sem os logs;
3. o problema atual precisa ser tratado em duas frentes: garantir que o build local seja o código certo e endurecer o fluxo de conexão para ele não “sumir” sem feedback.

Plano de implementação:

1. Ajustar o bootstrap nativo para não aplicar Live Updates em desenvolvimento
- Arquivo: `src/main.tsx`
- Fazer o `liveUpdateSync()` rodar só em produção/publicação, não em build local de debug.
- Assim o app aberto no Xcode usa o bundle gerado localmente em `dist`, evitando snapshot em cache sobrescrevendo suas mudanças.

2. Adicionar prova visual de clique no botão
- Arquivo: `src/components/HealthKitConnect.tsx`
- Inserir log imediato no início de `handleConnect`.
- Mostrar feedback de erro se `onConnect` não resolver em tempo razoável.
- Isso separa claramente “botão não chamou” de “hook travou”.

3. Fortalecer o hook do HealthKit
- Arquivo: `src/hooks/useHealthKit.ts`
- Manter os logs já planejados e acrescentar:
  - log inicial com `isIOS`, `isNative`, `isSupported`;
  - timeout explícito também no fluxo completo de `requestPermissions`;
  - mensagens mais específicas para:
    - plataforma não suportada;
    - plugin não importado;
    - `isAvailable` falso;
    - timeout de autorização.
- Se necessário, simplificar a importação do plugin para reduzir chance de falha silenciosa.

4. Validar a origem do bloqueio no fluxo
- Se os logs passarem a aparecer:
  - confirmar se trava em `getHealthPlugin`, `isAvailable` ou `requestAuthorization`;
  - então corrigir a chamada específica do plugin.
- Se ainda não aparecer nada:
  - revisar se o botão está dentro de alguma camada bloqueando eventos;
  - adicionar log também na página (`FitTracker`/`AppleHealth`) antes de passar `onConnect`.

5. Passos de teste depois da implementação
- Primeiro fazer git pull no projeto local.
- Depois rodar build/sync do Capacitor para atualizar o iOS com o bundle correto.
- Abrir no Xcode e testar no iPhone físico.
- Confirmar que:
  - os logs novos aparecem;
  - o prompt nativo do Apple Health abre ou retorna erro claro;
  - o botão não fica preso indefinidamente em “Conectando...”.

Detalhes técnicos
- Arquivos envolvidos:
  - `src/main.tsx`
  - `src/components/HealthKitConnect.tsx`
  - `src/hooks/useHealthKit.ts`
  - possivelmente `src/pages/FitTracker.tsx` e `src/pages/AppleHealth.tsx`
- Motivo principal da suspeita:
  - o componente reage ao clique;
  - os logs do hook não aparecem;
  - o app registra explicitamente que carregou um snapshot de cache do Live Updates.
- Observação importante:
  - aprovação na App Store não é o motivo desse sintoma. HealthKit pode ser testado em app instalado via Xcode, desde que capabilities, entitlements e `Info.plist` estejam corretos.

