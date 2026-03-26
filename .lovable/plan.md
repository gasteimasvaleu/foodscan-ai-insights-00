

## Adicionar logo acima do título no formulário iOS

### Alteração

**`src/components/AuthCard.tsx`** — No bloco `isNativeIOS`, adicionar a imagem do logo centralizada acima do `CardTitle`:

```tsx
<CardHeader className="pb-2">
  <div className="flex justify-center mb-2">
    <img
      src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/logoapp.png"
      alt="We Diet Logo"
      className="h-16 w-auto"
    />
  </div>
  <CardTitle className="text-center text-gray-800 text-lg">
    We Diet - Dieta Inteligente
  </CardTitle>
  ...
</CardHeader>
```

Só isso — uma imagem centralizada acima do título existente.

