## Objetivo
Adicionar um card hero acima do card de busca em `/mercado-facil`, com a imagem `galegacomsacola.png` à esquerda e o texto "Compare Preços e Economize" + subtítulo à direita.

## Mudança em `src/pages/mercado-facil/Index.tsx`
Inserir antes do card de busca (linha 94):

```tsx
<div className="bg-white border border-[#FD46A1]/30 rounded-3xl p-4 shadow-sm flex items-center gap-3">
  <img
    src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/galegacomsacola.png"
    alt=""
    className="w-24 h-24 object-contain shrink-0"
  />
  <div className="min-w-0">
    <h2 className="text-base font-semibold text-[#FD46A1] leading-tight">
      Compare Preços e Economize
    </h2>
    <p className="text-xs text-foreground/60 mt-1">
      Encontre os melhores preços em supermercados próximos a você
    </p>
  </div>
</div>
```

## Fora do escopo
- Animação, CTA ou link no card.
- Mudanças no card de busca.