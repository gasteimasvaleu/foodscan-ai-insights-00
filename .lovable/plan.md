# Corrigir largura do modal de detalhes em /alimentos

## Problema
O `DialogContent` do modal individual de alimento (aberto ao clicar em "+") usa apenas `max-w-sm`, mas o `DialogContent` base aplica `w-full`. Em telas mobile (390px), isso faz o modal grudar nas bordas, sem o respiro lateral do padrão do app.

## Padrão do app (referência)
`WidgetPromoModal.tsx` e outros usam:
```
w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl
```
Isso garante 1rem de margem em cada lado e cantos arredondados consistentes.

## Mudança
**Arquivo:** `src/pages/Alimentos.tsx`

No `<DialogContent>` do modal de detalhes do alimento (linha ~143), substituir:
```
className="bg-white/70 backdrop-blur-md border-2 border-primary rounded-3xl max-w-sm"
```
por:
```
className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl"
```

Mantém `max-w-sm` (compatível com o conteúdo compacto: input de gramas + grid 4 macros + botão), mas adiciona o respiro lateral e a sombra do padrão.

Nenhuma outra alteração necessária — header, close button (#FD46A1), grid de macros e botão já estão no padrão.
