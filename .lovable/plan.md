

## Trocar emoji do card Feminino por imagem 9:16

Em `src/components/AIGoalsWizard.tsx` (linhas 210-215), substituir o emoji 👩 por uma imagem em formato 9:16 dentro do `SelectCard` Feminino, mantendo o label "Feminino" abaixo, no mesmo padrão do card Masculino.

```tsx
<SelectCard selected={data.sex === 'female'} onClick={() => setData(d => ({ ...d, sex: 'female' }))}>
  <div className="flex flex-col items-center">
    <img
      src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/Imagem_IA_v11.jpeg"
      alt="Feminino"
      className="w-full aspect-[9/16] object-cover rounded-xl mb-2"
    />
    <span className="font-semibold text-gray-800">Feminino</span>
  </div>
</SelectCard>
```

