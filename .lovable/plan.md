## Objetivo
Mostrar o nome da loja no topo de todo card de produto (`MFProductCard`) no Mercado Fácil.

## Mudanças

### 1. `src/components/mercado-facil/MFProductCard.tsx`
- Nova prop opcional `lojaNome?: string`.
- Renderizar, **acima da imagem**, uma faixa compacta com o nome da loja:
  - `bg-white/60 backdrop-blur-sm`, `px-2 py-1`, `text-[10px] font-medium text-foreground/80`, `truncate`, ícone `Store` (lucide) de 10px à esquerda.
  - Só renderiza se `lojaNome` estiver presente (mantém compatibilidade).

### 2. `src/pages/mercado-facil/Index.tsx`
- Já carrega `lojas`. Montar `lojaNomeById = useMemo(() => Object.fromEntries(lojas.map(l => [l.id, l.nome])), [lojas])`.
- Passar `lojaNome={lojaNomeById[p.loja_id]}` nos dois usos de `<MFProductCard>` (busca filtrada e "produtos em destaque").

### 3. `src/pages/mercado-facil/Categoria.tsx`
- Após carregar produtos, fazer um `supabase.from("mf_lojas").select("id,nome").in("id", [...lojaIdsÚnicos])` e montar um map.
- Passar `lojaNome` no `<MFProductCard>`.

### 4. `src/pages/mercado-facil/Loja.tsx`
- **Não passar** `lojaNome` (redundante — o usuário já está dentro da loja).

## Fora de escopo
- Nada de mudança em tipos, hooks de carrinho, layout do grid, ou fluxo de checkout.
- Sem nova query agregada no banco; usamos os dados já disponíveis em cada página.