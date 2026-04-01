
Objetivo: parar de perder o target do widget de forma definitiva.

Diagnóstico (confirmado no código atual):
- `ios/App/App.xcodeproj/project.pbxproj` hoje tem só o target `App` (não existe `WeDietWidget`, `.appex` nem “Embed App Extensions”).
- O widget existe apenas como referência em `ios-widget-reference/WeDietWidget.swift` (não está integrado ao projeto iOS real).
- `npm run cap:sync` já existe e preserva o `project.pbxproj`, mas ele só preserva o que já está lá (não recria target ausente).
- `AppDebug.entitlements` e `AppRelease.entitlements` não têm App Group; isso pode quebrar a troca de dados com widget mesmo quando o target existir.

Plano de correção definitiva:
1) Recriar e versionar o target do widget no projeto iOS
- Criar no Xcode o target `WeDietWidget` (Widget Extension, sem App Intent).
- Copiar o conteúdo de `ios-widget-reference/WeDietWidget.swift` para o arquivo do target.
- Garantir que os arquivos do widget (Swift + plist + entitlements, se houver) fiquem dentro de `ios/App/...` e versionados no Git.
- Atualizar `project.pbxproj` com:
  - `PBXNativeTarget` do widget
  - produto `WeDietWidget.appex`
  - fase “Embed App Extensions” no target `App`
  - dependência `App -> WeDietWidget`

2) Corrigir capabilities/entitlements App ↔ Widget
- Adicionar `com.apple.security.application-groups` com `group.app.dietainteligente` em:
  - `ios/App/App/AppDebug.entitlements`
  - `ios/App/App/AppRelease.entitlements`
- Manter o mesmo App Group também no target do widget.
- Validar Signing & Capabilities dos dois targets no Xcode.

3) Blindar para não sumir de novo
- Manter uso obrigatório de `npm run cap:sync` (não usar `npx cap sync ios` direto).
- Endurecer `scripts/cap-sync.sh` com verificação:
  - antes/depois do sync, checar se `project.pbxproj` contém `WeDietWidget`;
  - se não contiver, abortar com erro explícito (evita seguir com projeto quebrado).
- Documentar no README interno do iOS o fluxo padrão (sync + resolução de conflito no pbxproj).

4) Teste end-to-end de regressão
- Confirmar no Xcode que existem os targets `App` e `WeDietWidget`.
- Build em iPhone físico.
- Adicionar widget na Home e validar dados (calorias/macros/hidratação).
- Rodar `npm run cap:sync`, reabrir Xcode e confirmar que o target continua.
- Fazer novo `git pull` (sem reset hard) e confirmar persistência.

Detalhes técnicos (resumo):
- O problema principal não é o Swift do widget, é o estado do `project.pbxproj` (target não versionado/perdido em pull/rebase/reset).
- O script atual protege o pbxproj, mas não recupera um target que já foi removido.
- Sem App Group em Debug/Release entitlements, o app pode não escrever no container compartilhado que o widget lê.

Ação emergencial imediata (para sair do bloqueio agora):
- Se houver rebase pendente, abortar.
- Recriar o target no Xcode.
- Commitar imediatamente os arquivos nativos do widget + `project.pbxproj`.
- A partir daí, usar apenas `npm run cap:sync`.
