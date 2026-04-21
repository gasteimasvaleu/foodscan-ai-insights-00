
## Padronizar Drawer "Adicionar ao Controle Diário" com glassmorphism do app

### Problema
O `DrawerContent` em `HomeRecipeCard.tsx` usa `bg-white/95` e ocupa toda a largura, fugindo do padrão glassmorphism do app (registrado em `mem://style/ui-modals`) e do estilo dos demais drawers (largura limitada em mobile, fundo translúcido com blur).

### O que muda
Apenas em `src/components/faca-em-casa/HomeRecipeCard.tsx`, no `<DrawerContent>` do CTA:

1. **Largura limitada e centralizada** (alinhada ao viewport mobile do app):
   - Adicionar `max-w-md mx-auto` ao `DrawerContent` para que em telas largas/desktop ele não estoure horizontalmente, mantendo a aparência mobile-first do restante do app.
   - Manter `inset-x-0 bottom-0` herdado, mas com cantos `rounded-t-3xl` (em vez do `rounded-t-[10px]` default) para casar com o restante (cards `rounded-3xl`).

2. **Glassmorphism padrão**:
   - Trocar `bg-white/95 backdrop-blur-xl border-t border-primary/20` por `bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl` (mesmo padrão dos demais drawers/modais do app).

3. **Padding interno consistente**:
   - Manter `DrawerHeader` e bloco interno, mas garantir `pb-[max(1.5rem,env(safe-area-inset-bottom))]` para safe area no iOS.

4. **Sem mudanças** no conteúdo (resumo nutricional + `MealTypeSelector` + botão Confirmar) nem no fluxo de salvar.

### Arquivo afetado
- `src/components/faca-em-casa/HomeRecipeCard.tsx` — apenas as classes do `<DrawerContent>` e o wrapper interno.

### Fora do escopo
- Alterar o componente base `src/components/ui/drawer.tsx` (mantemos os defaults; só sobrescrevemos via `className` neste uso para não impactar outros drawers do app).
