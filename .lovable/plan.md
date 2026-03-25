

## Configurar RevenueCat no App

### O que será feito
Inserir a API key do RevenueCat no hook existente e garantir que o fluxo de assinatura in-app funcione corretamente.

### Alteração

**Arquivo: `src/hooks/useRevenueCat.ts`**
- Substituir a constante `RC_API_KEY = ''` por `RC_API_KEY = 'test_gpQDqNpCbIkhVtyxKDelGynfEfk'`

### Observação
- Essa é uma chave pública (client-side SDK key), segura para ficar no código
- Quando for publicar na App Store em produção, você precisará gerar uma chave de **produção** no RevenueCat (sem o prefixo `test_`) e substituir
- Para o fluxo funcionar, você precisa ter configurado no RevenueCat: um **Offering** com um **Package** do tipo "Monthly" vinculado ao produto do App Store Connect

