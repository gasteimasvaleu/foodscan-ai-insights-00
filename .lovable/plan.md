
Objetivo: corrigir o fluxo de OTA no iOS agora que já ficou confirmado que o pod `CapacitorLiveUpdates` está instalado. A causa mais provável deixou de ser “plugin ausente” e passou a ser conflito/cache entre o Live Updates e o Service Worker web.

O que encontrei:
- O plugin nativo está configurado no `capacitor.config.ts` com `appId: f4605189`, canal `Production` e `autoUpdateMethod: 'background'`.
- O app chama `liveUpdateSync()` em `src/main.tsx`.
- Existe registro manual de Service Worker em `index.html`.
- O `public/sw.js` usa cache-first para navegação, scripts, estilos e imagens, o que pode servir assets antigos.
- O check atual em `index.html` depende de `window.Capacitor` existir cedo demais; no iOS isso pode falhar no momento do parse e registrar o SW mesmo dentro do app nativo.

Plano de implementação:
1. Remover o registro inline do Service Worker de `index.html`.
   - Motivo: hoje ele pode registrar indevidamente no app nativo.
2. Centralizar o controle de atualização em `src/main.tsx`.
   - Registrar SW apenas no web, usando import/runtime check confiável.
   - Manter `liveUpdateSync()` apenas no nativo.
3. Fortalecer a lógica de Live Updates no nativo.
   - Executar `sync()` com logs mais claros de sucesso/erro.
   - Recarregar a WebView quando `activeApplicationPathChanged` for `true`.
   - Opcionalmente sincronizar também quando o app voltar ao foreground, para reduzir casos em que o update foi baixado mas não aplicado no momento esperado.
4. Alinhar a config com o app que funciona.
   - Adicionar `maxVersions: 3` no bloco `LiveUpdates` para paridade e previsibilidade de cache.
5. Deixar o fluxo mais fácil de diagnosticar.
   - Adicionar logs temporários no startup do nativo para mostrar plataforma, resultado do `sync()` e se houve troca de bundle.

Validação prevista:
- Gerar novo binário iOS após essas mudanças.
- Instalar no iPhone.
- Publicar um Web Build novo no canal `Production`.
- Abrir o app uma vez para baixar, fechar completamente, abrir de novo para aplicar.
- Confirmar que a alteração visual (logo no login) aparece.

Detalhes técnicos:
- Arquivos a ajustar: `index.html`, `src/main.tsx`, `capacitor.config.ts`.
- Hipótese principal: o OTA está chegando, mas um Service Worker registrado indevidamente no shell nativo está servindo a versão web antiga do cache.
- Verificação extra fora do repo: após `npx cap sync ios`, confirmar localmente que `ios/App/App/capacitor.config.json` foi gerado com a seção `LiveUpdates`; esse arquivo é ignorado pelo git, então a presença dele precisa ser garantida no ambiente de build local/Appflow.
