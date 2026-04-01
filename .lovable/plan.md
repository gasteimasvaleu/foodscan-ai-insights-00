
## Padronizar header do WidgetGuide + adicionar ao menu

### Alterações

**1. `src/pages/WidgetGuide.tsx`** — Substituir o header atual (linhas 33-43) pelo padrão do app:
```tsx
<div className="mb-6 animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <Smartphone className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-xl font-bold text-[#FD46A1]">Widget iOS</h1>
  </div>
</div>
```
- Remover o botão `ArrowLeft` e o `<p>` de descrição (não fazem parte do padrão)
- Remover import de `ArrowLeft` e `useNavigate` (não mais necessários)

**2. `src/components/Navbar.tsx`** — Adicionar item no array `menuItems` (linha ~22):
```tsx
{ label: 'Widget iOS', href: '/widget-guide' },
```

### Detalhes técnicos
- O header segue exatamente o padrão documentado: `bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30`, ícone branco em box gradiente, título rosa `#FD46A1`
- O ícone `Smartphone` já está importado na página
