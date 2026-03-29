

## Atualizar build number para submissão na App Store

O build number atual no `project.pbxproj` está em **8** (nas configurações Debug e Release). Vou incrementar para **9** em ambas as ocorrências.

### Arquivo
- `ios/App/App.xcodeproj/project.pbxproj` — linhas 375 e 400: `CURRENT_PROJECT_VERSION = 8` → `CURRENT_PROJECT_VERSION = 9`

Alteração simples, sem impacto funcional. Depois de aplicar, basta fazer git pull no Mac e submeter via Xcode/Archive.

