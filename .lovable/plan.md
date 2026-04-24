
## Ajuste do modal "Seu look" no histórico do Provador

O `DialogContent` em `LookHistoryGrid.tsx` está usando `max-w-sm`, mas o `DialogContent` base (`src/components/ui/dialog.tsx`) aplica `w-full`, o que faz o modal esticar até o limite do `max-w-sm` e, em telas mobile (390px), ocupar praticamente toda a largura.

Os outros modais do app (ex.: `WidgetPromoModal`, modais de hidratação) respeitam uma margem lateral confortável. Vou alinhar este modal ao mesmo padrão.

### Mudança

**Arquivo**: `src/components/provador/LookHistoryGrid.tsx`

No `DialogContent`, trocar:
```
max-w-sm rounded-3xl
```
por:
```
w-[calc(100%-2rem)] max-w-xs sm:max-w-sm rounded-3xl
```

Isso garante:
- Margem lateral de **1rem em cada lado** no mobile (não cola nas bordas).
- Largura máxima de `max-w-xs` (~320px) no mobile e `max-w-sm` (~384px) em telas maiores.
- Mantém o glassmorphism e o `rounded-3xl` já existentes.

### Fora do escopo
- Mexer no `DialogContent` base (afetaria todos os outros modais do app).
- Alterar layout interno do modal (imagem, botões Baixar/Excluir).
- Ajustar a grid do histórico.
