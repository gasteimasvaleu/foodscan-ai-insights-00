## Padronizar card-título da página Loja

O card "Nossa Loja" atualmente usa um fundo rosa claro (#FFD1E7) com ícone na cor primária e título em `text-foreground`, fora do padrão dos cabeçalhos internos do app (Receitas, Apple Health, Widget Guide, etc.).

### Mudança em `src/pages/Loja.tsx`

Substituir o card-título atual pelo padrão global de page-header usado em `Receitas.tsx`:

```tsx
<div className="animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <ShoppingBag className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-lg font-bold text-primary">Nossa Loja</h1>
  </div>
</div>
```

Detalhes:
- Fundo: gradiente translúcido em tons de primary com `backdrop-blur-xl` (em vez de `#FFD1E7`).
- Ícone `ShoppingBag` em **branco** dentro de uma caixa com gradiente `from-primary to-accent`.
- Título em **`text-primary`** (rosa magenta da marca) com `text-lg font-bold`.
- Layout horizontal compacto, sem subtítulo (igual aos demais cabeçalhos internos).
