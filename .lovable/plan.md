

## Diagnóstico real

O código nativo **já está no padrão correto** (CAPPlugin + .m + MyViewController + AppDelegate). A estrutura é idêntica ao seu outro projeto que funciona.

O problema real é o arquivo **`AppDelegate 2.swift`** — ele tem uma segunda classe `AppDelegate` com `@UIApplicationMain`, criando um conflito de compilação. O Xcode pode estar usando a versão errada ou ignorando arquivos silenciosamente.

Sobre o erro de compra ("Código: desconhecido"): `purchaseMonthly()` não verifica se o RevenueCat foi inicializado antes de tentar comprar.

## Correções

### 1. Remover `ios/App/App/AppDelegate 2.swift`
Este arquivo duplicado tem `@UIApplicationMain` e conflita com o `AppDelegate.swift` principal. Deve ser deletado.

### 2. Adicionar guard de inicialização em `useRevenueCat.ts`
Em `purchaseMonthly()` e `restorePurchases()`, verificar `initialized` antes de chamar o SDK:

```typescript
const purchaseMonthly = async (): Promise<boolean> => {
  if (!initialized) {
    toast({
      title: 'Aguarde',
      description: 'Conectando à App Store...',
      variant: 'destructive',
    });
    await initRevenueCat();
    if (!initialized) return false;
  }
  // ... resto do código existente
};
```

Mesma lógica para `restorePurchases()`.

Também melhorar a mensagem de erro para incluir `err?.message`:
```typescript
description: `Não foi possível completar a compra. ${err?.message || 'Código: ' + (err?.code || 'desconhecido')}`,
```

### Arquivos
| Arquivo | Ação |
|---|---|
| `ios/App/App/AppDelegate 2.swift` | Deletar |
| `src/hooks/useRevenueCat.ts` | Guard de initialized + melhor erro |

### Após deploy
1. `git pull`
2. No Xcode: verificar que `AppDelegate 2.swift` não está no projeto
3. Product → Clean Build Folder
4. `npx cap sync ios`
5. Rebuild no device

