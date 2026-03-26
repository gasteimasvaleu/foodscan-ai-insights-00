

## Corrigir Build do AppFlow — Podfile não encontra node_modules

### Problema
O AppFlow executa `pod install` antes de rodar `npm install`, então o `Podfile` não consegue encontrar `node_modules/@capacitor/ios/scripts/pods_helpers`.

### Solução
Adicionar `npmInstallCommand` no `appflow.config.json` para garantir que as dependências Node sejam instaladas antes do CocoaPods.

### Alteração

**Arquivo:** `appflow.config.json`

```json
{
  "apps": [
    {
      "appId": "d8f89897",
      "iosPath": "ios/App",
      "npmInstallCommand": "npm ci"
    }
  ]
}
```

Isso instrui o AppFlow a rodar `npm ci` antes de tentar resolver o Podfile, garantindo que `node_modules/@capacitor/ios` exista.

