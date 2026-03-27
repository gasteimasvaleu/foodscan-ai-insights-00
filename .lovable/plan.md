

## Corrigir header e Navbar da página Comunidade

### Problemas
1. A página não importa nem renderiza o componente `<Navbar />`
2. O header usa um estilo próprio em vez do padrão gradiente das outras páginas
3. Falta o padding-top para compensar a navbar fixa

### Mudanças

**`src/pages/Comunidade.tsx`**:
- Importar e renderizar `<Navbar />` no topo
- Substituir o header customizado pelo padrão das outras páginas (gradiente rosa com ícone branco)
- Adicionar `pt-[calc(env(safe-area-inset-top)+2.5rem)]` no container principal

Header padrão a ser usado:
```tsx
<div className="mb-6 animate-fade-in">
  <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
    <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
      <Users className="w-6 h-6 text-white" />
    </div>
    <h1 className="text-lg font-bold text-[#FD46A1]">Comunidade</h1>
  </div>
</div>
```

