

## Incrementar build number para 3

Alterar `CURRENT_PROJECT_VERSION` de `2` para `3` em duas linhas do arquivo `ios/App/App.xcodeproj/project.pbxproj`:

- **Linha 375** (Debug): `CURRENT_PROJECT_VERSION = 2;` → `CURRENT_PROJECT_VERSION = 3;`
- **Linha 400** (Release): `CURRENT_PROJECT_VERSION = 2;` → `CURRENT_PROJECT_VERSION = 3;`

