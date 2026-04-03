

## Atualizar versão para 1.0.2 e build 15

### Alterações

**`ios/App/App.xcodeproj/project.pbxproj`** — 4 edições no target App:

| Configuração | Campo | Antes | Depois |
|--------------|-------|-------|--------|
| Debug | CURRENT_PROJECT_VERSION | 14 | 15 |
| Debug | MARKETING_VERSION | 1.0.1 | 1.0.2 |
| Release | CURRENT_PROJECT_VERSION | 14 | 15 |
| Release | MARKETING_VERSION | 1.0.1 | 1.0.2 |

O widget (WeDietWidget) permanece inalterado em 1.0 / build 1.

Após implementar, rode `npm run cap:sync` e gere o archive no Xcode para enviar à App Store.

