

## Atualizar link da App Store na página /auth

### Alteração

**Arquivo:** `src/pages/Auth.tsx` (linha 13)

De:
```
const APP_STORE_URL = 'https://apps.apple.com/app/we-diet/id000000000'; // placeholder
```

Para:
```
const APP_STORE_URL = 'https://apps.apple.com/app/we-diet/id6761124021';
```

Isso faz o botão "Baixar na App Store" no card pós-cadastro VIP apontar para o app real.

