

## Adicionar preço fallback de R$ 49,90

O RevenueCat não retorna offerings enquanto o app não está aprovado na App Store (ou configurado com StoreKit sandbox). O `price` fica `null` e aparece `...`.

### Alteração

**`src/components/AuthCard.tsx` (linha 103)**
- De: `{price || '...'}`
- Para: `{price || 'R$ 49,90'}`

Quando o app for aprovado e o RevenueCat conseguir buscar o preço real da App Store, ele será exibido automaticamente no lugar do fallback.

