
## Corrigir o erro do AppFlow no iOS

### Diagnóstico
Seu palpite sobre “estar buscando o `Podfile:1` em vez de `Podfile`” não é o problema principal.

O log `from .../ios/App/Podfile:1` só está dizendo que o erro aconteceu na linha 1 do arquivo correto: `ios/App/Podfile`.

O problema real é outro:
- o `Podfile` tenta carregar `../../node_modules/@capacitor/ios/scripts/pods_helpers`
- esse arquivo só existe depois que as dependências Node forem instaladas
- no seu `appflow.config.json`, a chave usada está como `npmInstallCommand`
- pela documentação do AppFlow, a chave suportada é `dependencyInstallCommand`

Então o AppFlow provavelmente ignorou essa configuração, não rodou a instalação antes, e por isso o `Podfile` falhou.

### O que vou ajustar
Vou atualizar `appflow.config.json` para trocar:

```json
"npmInstallCommand": "npm ci"
```

por:

```json
"dependencyInstallCommand": "npm ci"
```

mantendo também:
```json
"appId": "d8f89897",
"iosPath": "ios/App"
```

### Resultado esperado
Com isso, o AppFlow deve:
1. rodar `npm ci` na raiz do repositório
2. criar `node_modules`
3. encontrar `@capacitor/ios/scripts/pods_helpers`
4. só então processar o `ios/App/Podfile`

### Arquivo que será alterado
- `appflow.config.json`

### Observação técnica
O `Podfile` atual está coerente com a estrutura do projeto:
```ruby
require_relative '../../node_modules/@capacitor/ios/scripts/pods_helpers'
```

Como ele está em `ios/App/Podfile`, subir dois níveis até a raiz e entrar em `node_modules` está correto.

### Depois da alteração
Você deve subir esse ajuste e rodar o build novamente no AppFlow. Se ainda falhar, o próximo ponto a validar será se o AppFlow está realmente usando o `appflow.config.json` atualizado no commit do build.

### Resumo técnico
- `ios/App/Podfile` está no caminho certo
- o erro não é “arquivo errado”, e sim “dependências ainda não instaladas”
- a chave no `appflow.config.json` está incorreta para AppFlow
- a correção é trocar para `dependencyInstallCommand`
