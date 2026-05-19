## Substituir chips por Drawer com WheelPicker em `src/pages/ToAqui.tsx`

Trocar a linha horizontal de botões de categoria (linhas 74-99) por um seletor **Button + Drawer + WheelPicker** seguindo exatamente o padrão de `src/pages/Loja.tsx`.

### Mudanças
1. **Imports**: adicionar `Drawer`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerFooter` de `@/components/ui/drawer`; `WheelPicker` de `@/components/ui/wheel-picker`; ícone `ChevronDown`.
2. **State**: `isCategoryDrawerOpen` e `pendingCategory` (com sentinela `ALL_VALUE = "__all__"`).
3. **UI**: substituir o bloco de chips por um `<Button variant="outline">` largura total mostrando o emoji+label da categoria atual (ou "Todas as categorias"), com `ChevronDown` à direita. Ao clicar abre o Drawer.
4. **Drawer**: glassmorphism `bg-white/70 backdrop-blur-md border-2 border-primary`, `max-w-md mx-auto rounded-t-2xl`, título "Selecionar Categoria", `WheelPicker` com `[{ Todas }, ...VENUE_CATEGORIES]`, footer com Cancelar/Confirmar (padrão pink primary).
