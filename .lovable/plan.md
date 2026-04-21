

## Restaurar imagem do welcome do Assistente de Metas (1:1)

Voltar a imagem do passo 0 (welcome) do `AIGoalsWizard` para `boneco.png` em formato quadrado 1:1.

### Mudança em `src/components/AIGoalsWizard.tsx` (linhas 177-181)

Substituir o `<img>` atual (`Imagem_IA_v11.jpeg` em 9:16) por:

```tsx
<img
  src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/boneco.png"
  alt="Assistente de Metas"
  className="w-40 h-40 object-contain"
/>
```

Mantém proporção 1:1 (w-40 h-40 = 160x160px) e centralização já existente.

