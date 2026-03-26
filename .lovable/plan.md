

## Incrementar Build Number para 5

O build atual é **4** (Debug e Release). Para enviar uma nova versão ao App Store Connect, basta incrementar para **5**.

**Arquivo**: `ios/App/App.xcodeproj/project.pbxproj`
- Linha 375 (Debug): `CURRENT_PROJECT_VERSION = 4` → `5`
- Linha 400 (Release): `CURRENT_PROJECT_VERSION = 4` → `5`

A `MARKETING_VERSION` continua em 1.0 (a menos que você queira mudar a versão visível ao usuário).

