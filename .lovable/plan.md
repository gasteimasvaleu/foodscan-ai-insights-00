

## Envolver o timer circular em um card com fundo cinza

### Alteração
**Editar**: `src/pages/IntermittentFasting.tsx` (linha ~234)

Envolver o `div` do ring timer (`relative w-[160px] h-[160px]`) em um card com fundo cinza claro (`bg-[#F9FAFB]`), cantos arredondados e padding, para destacar visualmente o timer:

```tsx
<div className="flex justify-center">
  <div className="bg-[#F9FAFB] rounded-2xl p-6 shadow-sm">
    <div className="relative w-[160px] h-[160px] flex items-center justify-center">
      {/* SVG e texto existentes */}
    </div>
  </div>
</div>
```

