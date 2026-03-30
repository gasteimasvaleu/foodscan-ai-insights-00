

## Atualizar Build Number para 13

O build number atual é **12** (Debug e Release). Vou incrementar para **13** nas duas configurações no arquivo `ios/App/App.xcodeproj/project.pbxproj`.

### Alteração

**Arquivo:** `ios/App/App.xcodeproj/project.pbxproj`
- Linha 375: `CURRENT_PROJECT_VERSION = 12` → `CURRENT_PROJECT_VERSION = 13` (Debug)
- Linha 400: `CURRENT_PROJECT_VERSION = 12` → `CURRENT_PROJECT_VERSION = 13` (Release)

Após a alteração, faça `git pull` e `npx cap sync ios` antes de arquivar no Xcode.

