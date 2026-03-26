

## Corrigir o Build iOS — Restaurar Referências e Adicionar `cap sync`

### O que aconteceu
Eu removi as referências de `public`, `config.xml` e `capacitor.config.json` do `project.pbxproj` sem avisar que isso quebraria o app em runtime. Esses arquivos são essenciais — o Capacitor precisa deles para carregar o conteúdo web no app nativo. Peço desculpas pelo erro.

### Solução correta (2 passos)

**1. Restaurar as referências no `project.pbxproj`**

Adicionar de volta no arquivo `ios/App/App.xcodeproj/project.pbxproj`:
- File references para `public`, `config.xml`, `capacitor.config.json`
- Entradas no grupo `App` (children)
- Build files na seção `Resources`

**2. Fazer o `cap sync` rodar no CI antes do archive**

Atualizar `appflow.config.json` para que o comando de dependências também faça build e sync:

```json
{
  "apps": [
    {
      "appId": "d8f89897",
      "iosPath": "ios/App",
      "dependencyInstallCommand": "npm ci && npm run build && npx cap sync ios --no-build"
    }
  ]
}
```

Isso garante que:
1. `npm ci` instala as dependências Node
2. `npm run build` gera o `dist/` com o app web
3. `npx cap sync ios --no-build` copia `dist/` para `ios/App/App/public`, gera `config.xml` e `capacitor.config.json`, e roda `pod install`

### Arquivos a alterar
- `ios/App/App.xcodeproj/project.pbxproj` — restaurar referências removidas
- `appflow.config.json` — expandir o comando de dependências

### Por que isso resolve
- O `.gitignore` do iOS ignora esses arquivos (corretamente — são gerados)
- O `cap sync` gera esses arquivos antes do Xcode tentar compilar
- O `project.pbxproj` precisa referenciá-los para que o Xcode os inclua no bundle

### Resultado esperado
- O AppFlow roda `npm ci && npm run build && npx cap sync ios`
- Os arquivos `public/`, `config.xml`, `capacitor.config.json` são criados em `ios/App/App/`
- O Xcode archive encontra todos os recursos e compila com sucesso

