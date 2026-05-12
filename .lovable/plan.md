## Atualização de versão para envio à App Store

Versão atual: `MARKETING_VERSION = 1.0.6` / `CURRENT_PROJECT_VERSION = 20`.

### Mudança proposta

Em `ios/App/App.xcodeproj/project.pbxproj` (configs Debug e Release, app + widget):

- `MARKETING_VERSION`: `1.0.6` → `1.0.7`
- `CURRENT_PROJECT_VERSION`: `20` → `21`

Aplica-se aos 4 blocos: App Debug, App Release, WeDietWidget Debug, WeDietWidget Release (app e widget devem ter a mesma versão para o Appflow gerar o IPA corretamente).

### Próximos passos (Appflow)

Depois do bump, é só rodar um novo build no Appflow (branch `main`) usando o perfil de Release. O IPA gerado já vai sair com a versão `1.0.7 (21)` pronta para upload no App Store Connect.

Confirma o bump para `1.0.7 (21)`? Se quiser outro número (ex.: pular para `1.1.0`), me diga.