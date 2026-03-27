

## Incrementar build number para App Store

O build atual está em **7** (Debug e Release). Vou incrementar para **8**.

### Correção
**Arquivo:** `ios/App/App.xcodeproj/project.pbxproj`

- Linha 375 (Debug): `CURRENT_PROJECT_VERSION = 7` → `CURRENT_PROJECT_VERSION = 8`
- Linha 400 (Release): `CURRENT_PROJECT_VERSION = 7` → `CURRENT_PROJECT_VERSION = 8`

Duas linhas, mesma mudança. A `MARKETING_VERSION` continua em 1.0.

