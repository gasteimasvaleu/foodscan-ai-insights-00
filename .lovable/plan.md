## Objetivo
Incrementar a versão de marketing e o número de build do app iOS para refletir as novas funcionalidades (Mercado Fácil, Tô Aqui, Finanças).

## Estado Atual
- **MARKETING_VERSION**: `1.0.9`
- **CURRENT_PROJECT_VERSION**: `23`

## Mudanças Propostas
- **Nova versão**: `1.1.0` (minor bump, justificado pelas novas funcionalidades)
- **Novo build**: `24`

## Arquivo Alterado
```
ios/App/App.xcodeproj/project.pbxproj
```

Substituir todas as 4 ocorrências de:
- `CURRENT_PROJECT_VERSION = 23;` → `CURRENT_PROJECT_VERSION = 24;`
- `MARKETING_VERSION = 1.0.9;` → `MARKETING_VERSION = 1.1.0;`

## Pós-Build
Após aprovação e merge, será necessário rodar `npx cap sync ios` e gerar novo build nativo via Appflow para upload ao App Store Connect (a alteração no `.pbxproj` não é aplicável via Live Update OTA).