## Objetivo

Adicionar, no Dashboard logado (`/`), um card no mesmo formato do `NoveltyCard` logo abaixo do AuthCard (boas-vindas) e acima do `NoveltyCard` atual, divulgando o "Tô Aqui".

## Implementação

**Novo componente:** `src/components/ToAquiPromoCard.tsx`
- Cópia da estrutura do `NoveltyCard` (Link 21:9, imagem absoluta, faixa translúcida `bg-black/55 backdrop-blur-sm` na base).
- `to="/to-aqui"`.
- Imagem: `https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/021779196477043682bfa727eaa8ae907bb4f408e14b63d586dcb_0.jpeg` (alt: "Tô Aqui — converse com quem está no mesmo lugar").
- Faixa inferior:
  - Tag superior: "TÔ AQUI" em `text-[#FFD1E7] text-xs font-bold uppercase tracking-wider`.
  - Texto: "Quer saber e conversar com quem tá no seu bar, festa ou restaurante? Clica aqui." em `text-white text-sm leading-snug`.

**Edit:** `src/pages/Index.tsx` (linha 111-112)
- Inserir `<ToAquiPromoCard />` entre `<AuthCard />` e `<NoveltyCard />`.
- Adicionar o import.

## Fora do escopo

- Sem mudança no `NoveltyCard` nem nos outros decks.
- Sem nova rota, tabela ou tracking.
