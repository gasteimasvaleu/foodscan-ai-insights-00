

## Remover Card do logo no estado logado

O Card com o logo (linhas 71-80 em `src/components/AuthCard.tsx`) foi adicionado por engano no fluxo de usuário autenticado. Será removido.

### Mudança

**`src/components/AuthCard.tsx`** — Remover o bloco:
```tsx
<Card className="bg-[#FFD1E7] backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl overflow-hidden">
  <CardContent className="p-4 flex justify-center">
    <img src="...logoapp.png" ... />
  </CardContent>
</Card>
```

Isso remove o Card separado com o logo que aparece acima do banner quando o usuário está logado. O logo já está corretamente posicionado dentro dos formulários de login.

