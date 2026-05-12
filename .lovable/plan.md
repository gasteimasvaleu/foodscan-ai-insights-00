## Mudança

Adicionar um card de novidade entre `<AuthCard />` e `<HeroDeckRow />` em `src/pages/Index.tsx`.

### Novo componente: `src/components/NoveltyCard.tsx`
- Link clicável (`<Link to="/maternidade">`) com `aspect-[21/9] w-full rounded-3xl overflow-hidden relative shadow-lg`.
- Imagem de fundo: `https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/image_1778616139478_559b027e.png` (`absolute inset-0 w-full h-full object-cover`).
- Faixa preta translúcida na parte inferior: `absolute bottom-0 left-0 right-0 bg-black/55 backdrop-blur-sm px-4 py-3`.
- Conteúdo da faixa:
  - Badge/título "Novidade" — `text-[#FFD1E7] text-xs font-bold uppercase tracking-wider`.
  - Descrição — `text-white text-sm leading-snug`: "Tentantes, gestação, pós-parto e bebê em um só lugar."
- `alt` descritivo na imagem para SEO/acessibilidade.

### Integração em `src/pages/Index.tsx`
```tsx
<AuthCard />
<NoveltyCard />
<HeroDeckRow />
```

## Fora do escopo
Outras páginas, alterações no AuthCard ou nos decks.
