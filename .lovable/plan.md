

## Corrigir erro: Vite analisa `import('@capacitor/app')` mesmo sendo dinâmico

### Problema
O plugin `vite:import-analysis` resolve **todos** os imports dinâmicos, incluindo `import('@capacitor/app')`. O módulo não existe no ambiente Lovable, então falha.

### Solução
Tornar o string do import **opaco** para o analisador estático do Vite, usando uma variável intermediária:

```typescript
const mod = '@capacitor/app';
const capApp = await import(/* @vite-ignore */ mod);
```

O comentário `/* @vite-ignore */` instrui o Vite a não tentar resolver esse import dinâmico.

### Alteração
- **`src/hooks/useWidgetSyncOnLaunch.ts`** (linha 98): substituir `import('@capacitor/app')` por `import(/* @vite-ignore */ '@capacitor/app')` para que o Vite ignore a resolução desse módulo.

