## Atenção sobre o build number

O `CURRENT_PROJECT_VERSION` atual no projeto iOS é **15**, não 5. A App Store Connect **rejeita** qualquer build com número menor ou igual ao último já enviado para aquela versão de marketing. Portanto, não é possível enviar build `6`.

Vou subir para **build 16** (o próximo válido). Se você preferir um número diferente, é só pedir — desde que seja maior que 15.

## Mudanças

### `ios/App/App.xcodeproj/project.pbxproj`
Atualizar os dois targets (Debug e Release) do app principal:

- Linha 479: `CURRENT_PROJECT_VERSION = 15;` → `CURRENT_PROJECT_VERSION = 16;`
- Linha 484: `MARKETING_VERSION = 1.0.2;` → `MARKETING_VERSION = 1.0.3;`
- Linha 504: `CURRENT_PROJECT_VERSION = 15;` → `CURRENT_PROJECT_VERSION = 16;`
- Linha 509: `MARKETING_VERSION = 1.0.2;` → `MARKETING_VERSION = 1.0.3;`

As linhas 526/532 e 550/556 pertencem ao target do **WeDietWidget** (extensão) e seguem versionamento próprio — não serão alteradas para evitar quebrar a relação atual com o app host.

## Próximos passos (após aprovação)
1. Commit/push para o GitHub
2. Disparar o build iOS Package (Release) no Appflow
3. Submeter para revisão na App Store Connect
