

# Plano: Remover hook useRevenueCat e usar lib diretamente no AuthCard

## Problema
O erro "Código: desconhecido" ocorre na compra via RevenueCat. O outro projeto funciona porque importa diretamente de `@/lib/revenuecat` e gerencia estado localmente com `useState`, sem passar pelo hook `useRevenueCat`.

## Causa provável
O hook `useRevenueCat` adiciona camadas extras (efeitos de inicialização, checagem de status, logIn automático) que podem interferir no fluxo de compra — por exemplo, chamando `checkSubscriptionStatus()` ou `logInRevenueCat()` antes do SDK estar pronto, ou re-renderizando durante a compra.

## O que vai mudar

### 1. Refatorar `AuthCard.tsx`
- Remover import do `useRevenueCat`
- Importar diretamente de `@/lib/revenuecat`: `initRevenueCat`, `getSubscriptionPrice`, `purchaseMonthly`, `restorePurchases`, `checkSubscriptionStatus`
- Gerenciar `price`, `hasPurchased`, `rcLoading` com `useState` local
- Inicializar RevenueCat em um `useEffect` simples (só no iOS nativo)
- Chamar `purchaseMonthly` diretamente no handler, com try/catch local e melhor tratamento do erro (log do objeto completo do erro)

### 2. Refatorar `SubscriptionRequired.tsx`
- Mesmo padrão: remover `useRevenueCat`, importar direto da lib
- Estado local para `loading` e `price`

### 3. Manter `useRevenueCat.ts` e `revenuecat.ts` intactos
- Não deletar o hook (pode ser útil futuramente), apenas parar de usá-lo nos componentes críticos

### Detalhe técnico
O padrão do outro projeto que funciona:
```text
Componente → useState local → import { purchaseMonthly } from '@/lib/revenuecat'
```
vs o padrão atual que falha:
```text
Componente → useRevenueCat hook → useEffect init → useEffect logIn → purchaseMonthly wrapper
```
A simplificação elimina race conditions entre os múltiplos useEffects do hook.

