## Atualizar versão do app iOS

Versão atual no Xcode: `1.0.4 (17)` — já enviada ao App Store Connect, então precisamos incrementar antes de fazer novo upload.

## Nova versão proposta

- **MARKETING_VERSION**: `1.0.4` → `1.0.5`
- **CURRENT_PROJECT_VERSION (build)**: `17` → `18`

Como esta é uma correção do splash screen no iPhone real (não muda funcionalidade do app, só comportamento nativo), faz sentido subir a versão de marketing também — mas se preferir manter `1.0.4` e só subir o build para `18`, também funciona no App Store Connect (cada build precisa ser único dentro da mesma versão).

## Alterações

**Arquivo: `ios/App/App.xcodeproj/project.pbxproj`**

Atualizar as 4 ocorrências de cada chave (Debug + Release, App + Widget targets):
- `CURRENT_PROJECT_VERSION = 17;` → `CURRENT_PROJECT_VERSION = 18;`
- `MARKETING_VERSION = 1.0.4;` → `MARKETING_VERSION = 1.0.5;`

## Após aprovação, no seu Mac

```bash
git pull
npm ci          # resolve o erro do @capacitor/browser
npm run build
npm run cap:sync
```

Depois no Xcode: Product → Archive → Distribute App.

## Pergunta

Confirma `1.0.5 (18)` ou prefere manter `1.0.4 (18)` (só sobe o build)?