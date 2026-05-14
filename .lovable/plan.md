## Objetivo
Atualizar a versão e o build do app iOS para envio à App Store Connect.

## Valores alvo
- `MARKETING_VERSION`: **1.0.8**
- `CURRENT_PROJECT_VERSION`: **22**

## Passos

1. **Atualizar `ios/App/App.xcodeproj/project.pbxproj`**
   - Substituir todas as ocorrências de `MARKETING_VERSION = 1.0.7;` por `MARKETING_VERSION = 1.0.8;`
   - Substituir todas as ocorrências de `CURRENT_PROJECT_VERSION = 21;` por `CURRENT_PROJECT_VERSION = 22;`

2. **Atualizar a memória de versionamento**
   - Atualizar `mem://architecture/native-app/versioning` para refletir os novos valores (1.0.8 / 22)

## Notas
- O target `WeDietWidget` mantém seu próprio versionamento e **não** será alterado (conforme memória existente).
- Não é necessário alterar o `package.json` — a versão web não impacta o envio iOS.
- Após a mudança, o usuário deve fazer git pull local e buildar/exportar via Xcode normalmente.