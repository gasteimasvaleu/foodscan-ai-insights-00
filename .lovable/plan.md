

## Atualizar Build Number para App Store Connect

### Alteração

**Arquivo: `ios/App/App.xcodeproj/project.pbxproj`**

Incrementar `CURRENT_PROJECT_VERSION` de **6** para **7** nas duas ocorrências (Debug e Release).

### Comandos para executar no terminal

Após o git pull com as alterações:

```bash
cd /caminho/do/projeto
git pull
npm install
npm run build
npx cap sync ios
```

Depois, abra o Xcode e faça o archive:

```bash
npx cap open ios
```

No Xcode: **Product → Archive** → Upload to App Store Connect.

