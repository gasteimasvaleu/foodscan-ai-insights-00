

## Problema

O erro `"Purchases must be configured before calling this function"` acontece porque o guard que adicionei tem um bug de closure do React:

1. `purchaseMonthly()` verifica `if (!initialized)` → é `false`
2. Chama `await initRevenueCat()` → que faz `setInitialized(true)`
3. Mas `initialized` na closure de `purchaseMonthly` **continua `false`** (stale closure)
4. Retorna `false` sem nunca tentar a compra
5. Ou pior: em cenários de race condition, tenta comprar antes do configure terminar

O código original **não tinha esse guard** e funcionava porque o `useEffect` já cuidava da inicialização. Minha mudança quebrou isso.

## Correção

**Arquivo: `src/hooks/useRevenueCat.ts`**

1. Adicionar um `useRef` para rastrear inicialização (refs não sofrem de stale closure):
   ```typescript
   const initializedRef = useRef(false);
   ```

2. Em `initRevenueCat`, setar tanto o state quanto o ref:
   ```typescript
   setInitialized(true);
   initializedRef.current = true;
   ```

3. Em `purchaseMonthly` e `restorePurchases`, usar o ref no guard:
   ```typescript
   if (!initializedRef.current) {
     await initRevenueCat();
     if (!initializedRef.current) {
       // mostrar erro e retornar false
       return false;
     }
   }
   ```

Isso garante que o guard funcione corretamente sem stale closures, mantendo a proteção contra chamadas antes do configure.

