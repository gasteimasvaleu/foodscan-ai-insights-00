

## Problema: Widget não recebe valor de hidratação

### Causa raiz

Duas questões no `useWidgetSync`:

1. **`hydrationMl` não tem `Math.round`** — o valor pode ser um decimal (ex: `1500.5`) e o Swift espera `Int`. O `call.getInt()` no plugin nativo retorna `nil` para valores não-inteiros, resultando em `0`.

2. **`hydrationMl` pode ser negativo** — bebidas desidratantes (ex: álcool) têm `hydration_impact_ml` negativo. O `useWidgetSyncOnLaunch` aplica `Math.round(Math.max(0, hydrationMl))`, mas o `useWidgetSync` não.

### Correção

**Arquivo: `src/hooks/useWidgetSync.ts`** (linha 44)

Alterar de:
```ts
hydrationMl,
```
Para:
```ts
hydrationMl: Math.round(Math.max(0, hydrationMl)),
```

Isso garante que o valor enviado ao plugin nativo seja sempre um inteiro não-negativo, consistente com o que o `useWidgetSyncOnLaunch` já faz.

