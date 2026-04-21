

## Trocar emoji do card Masculino por imagem 9:16

### Mudança em `src/components/AIGoalsWizard.tsx` (linhas 200-205)

Substituir o emoji 👨 por uma imagem em formato 9:16 dentro do `SelectCard` Masculino, mantendo o label "Masculino" abaixo.

```tsx
<SelectCard selected={data.sex === 'male'} onClick={() => setData(d => ({ ...d, sex: 'male' }))}>
  <div className="flex flex-col items-center">
    <img
      src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/image_1776770748116_c4d71cac.jpg"
      alt="Masculino"
      className="w-full aspect-[9/16] object-cover rounded-xl mb-2"
    />
    <span className="font-semibold text-gray-800">Masculino</span>
  </div>
</SelectCard>
```

O card Feminino (linhas 206-211) permanece inalterado por enquanto — pode pedir depois se quiser substituir também.

