

## Atualizar chave do RevenueCat

### O que será feito
Substituir a API key antiga do RevenueCat pela nova chave do projeto recriado.

### Alteração

**Arquivo: `src/hooks/useRevenueCat.ts`**
- Linha 13: Trocar `RC_API_KEY = 'test_gpQDqNpCbIkhVtyxKDelGynfEfk'` por `RC_API_KEY = 'test_TEmDfKCvkDMhVHaGfrvFibDod0E'`

### Observações
- Essa é a chave pública do Test Store (sandbox), segura para ficar no código
- Para produção: adicionar o app iOS em **Apps & providers** no RevenueCat, e a chave de produção aparecerá na aba API keys
- Quando a chave de produção existir, será necessário substituir novamente

