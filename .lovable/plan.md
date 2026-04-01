

## Expandir o card do timer para largura total

### Alteração
**Editar**: `src/pages/IntermittentFasting.tsx` (linha ~238-239)

Remover o `flex justify-center` do wrapper e fazer o card cinza ocupar 100% da largura, com o SVG centralizado dentro:

```tsx
<div className="bg-[#F9FAFB] rounded-2xl p-6 shadow-sm">
  <div className="relative w-[160px] h-[160px] flex items-center justify-center mx-auto">
```

O card cinza passa a ter largura total (igual ao botão), e o timer circular fica centralizado dentro dele com `mx-auto`.

