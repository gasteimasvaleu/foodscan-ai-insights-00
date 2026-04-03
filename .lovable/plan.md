

## Correção: direção inconsistente da animação

### Causa
O componente remonta ao navegar de volta à página, e o `setTimeout` de 100ms nem sempre é suficiente para garantir que o browser renderize o estado inicial (opacity 0, translateY 30px) antes de aplicar o estado final. Dependendo do timing do React e do browser, o estado "antes" pode não ser pintado, causando comportamento inconsistente.

### Solução

**`src/components/QuickActions.tsx`**:
1. Usar `requestAnimationFrame` duplo em vez de `setTimeout` — isso garante que o browser pinte o frame inicial antes de disparar a transição
2. Adicionar `sessionStorage` check para pular a animação quando o usuário volta à página (evita re-trigger desnecessário)

```tsx
useEffect(() => {
  const hasAnimated = sessionStorage.getItem('quickActionsAnimated');
  if (hasAnimated) {
    setIsVisible(true);
    return;
  }
  // Double rAF garante que o browser pintou o estado inicial
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setIsVisible(true);
      sessionStorage.setItem('quickActionsAnimated', 'true');
    });
  });
}, []);
```

Apenas 1 arquivo alterado, ~10 linhas modificadas.

