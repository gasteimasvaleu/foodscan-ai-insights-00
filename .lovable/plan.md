

## Corrigir card de título do NutriCoach

### Problema
O card de título da página NutriCoach está fora do padrão visual do app:
- Gradiente usa `from-red-500/20 via-pink-500/20 to-primary/20` (diferente do padrão)
- Texto usa `text-[#FD46A1]` em vez de `text-primary`
- Tem ícone `Bot` solto (sem wrapper) — o usuário quer remover o ícone

### Padrão das outras páginas (sem ícone, conforme solicitado)
```
bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30
backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3
```
Texto: `text-xl font-bold text-primary`

### Alteração

**`src/pages/NutriCoach.tsx`** — linha 210-212:

Remover o ícone `Bot` do card de título, corrigir o gradiente e a cor do texto:

```tsx
<div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3">
  <h1 className="text-xl font-bold text-primary">NutriCoach</h1>
</div>
```

Também remover o import de `Bot` se não for mais usado em outro lugar da página (ainda é usado no modal do chat, então manter o import).

