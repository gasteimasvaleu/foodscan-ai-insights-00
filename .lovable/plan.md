

# Plano: Remover o hook useRevenueCat

## Situação
Após as mudanças anteriores, `AuthCard.tsx` e `SubscriptionRequired.tsx` já importam diretamente de `@/lib/revenuecat`. O arquivo `src/hooks/useRevenueCat.ts` não é importado por nenhum componente — está completamente órfão.

Para alinhar 100% com a arquitetura do outro projeto (que nunca teve esse hook), basta deletá-lo.

## Alteração

| Ação | Arquivo |
|------|---------|
| Deletar | `src/hooks/useRevenueCat.ts` |

Nenhuma outra mudança necessária. Depois disso, faça o pull no Mac e rebuild.

## Passos pós-mudança (no Mac)
1. `git pull --rebase`
2. `cd ios/App && pod install`
3. Build + teste de compra no sandbox iOS

