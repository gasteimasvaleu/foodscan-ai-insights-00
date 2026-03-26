

## Corrigir flag inválida no `cap sync`

### Problema
O comando `npx cap sync ios --no-build` falhou porque `--no-build` não existe no Capacitor CLI. Por isso o `cap sync` nunca executou e os arquivos `public/`, `config.xml`, `capacitor.config.json` não foram gerados.

### Correção
Trocar `--no-build` por `-- --no-build` ou simplesmente remover a flag. Como já fazemos `npm run build` antes, o `dist/` já existe. O `cap sync` sem flags vai apenas copiar o `dist/` para `ios/App/App/public` e gerar os outros arquivos.

### Alteração
**`appflow.config.json`** - linha 6:
```json
"dependencyInstallCommand": "npm ci && npm run build && npx cap sync ios"
```

### Resultado esperado
- `npm run build` gera `dist/`
- `npx cap sync ios` copia para `ios/App/App/public`, gera `config.xml` e `capacitor.config.json`, roda `pod install`
- Xcode archive encontra todos os recursos

