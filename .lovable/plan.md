## Substituir chips por seletor Drawer + WheelPicker

Trocar a linha de chips horizontais "Todas / Roupas e Acessórios / Beleza / Vitaminas e Suplementos" (e a linha de subcategorias) por **dois botões seletores** que abrem **Drawers com WheelPicker**, exatamente no padrão usado em `Receitas.tsx`.

### Mudanças em `src/pages/Loja.tsx`

1. **Imports adicionais**:
   - `Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter` de `@/components/ui/drawer`.
   - `WheelPicker` de `@/components/ui/wheel-picker`.
   - `ChevronDown` de `lucide-react`.

2. **Remover** o componente local `CategoryChip` e os dois blocos de chips horizontais.

3. **Novo estado**:
   - `isCategoryDrawerOpen`, `isSubcategoryDrawerOpen`.
   - `pendingCategory`, `pendingSubcategory` (valor temporário enquanto o drawer está aberto, confirmado no botão "Confirmar").

4. **Layout abaixo do input de busca**: linha com 1 ou 2 botões `variant="outline"`:
   - **Botão Categoria** (sempre visível): mostra "Categoria" ou o label da categoria selecionada + `ChevronDown`. Clica → abre drawer com WheelPicker das opções `[Todas, Roupas e Acessórios, Beleza, Vitaminas e Suplementos]`.
   - **Botão Subcategoria** (visível apenas quando a categoria selecionada tem subcategorias, ou seja, `roupas` ou `beleza`): mostra "Subcategoria" ou o label selecionado. Clica → abre drawer com `[Todas, ...subcategorias da categoria atual]`.

5. **Drawers** seguem exatamente o estilo de Receitas:
   - `DrawerContent` com `w-[calc(100%-2rem)] max-w-md mx-auto rounded-t-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl px-4 pb-4 max-h-[75vh]`.
   - `DrawerHeader` com `DrawerTitle` ("Selecionar Categoria" / "Selecionar Subcategoria").
   - `WheelPicker` com `visibleItems={5}` e `itemHeight={44}`, recebendo `pendingCategory`/`pendingSubcategory` e as opções no formato `{ value, label }` (usando `""` para representar "Todas" → null).
   - `DrawerFooter` com botões "Cancelar" (fecha sem aplicar) e "Confirmar" (aplica o valor pendente em `activeCategory`/`activeSubcategory`).

6. **Comportamento de seleção**:
   - Ao confirmar uma nova categoria, **reseta** `activeSubcategory` para null (igual ao comportamento atual de `handleSelectCategory`).
   - Função "Limpar" (já existente nos resultados filtrados) continua zerando categoria, subcategoria e busca.

A lógica de filtragem (`filteredResults`, `isFiltering`, etc.) e os carrosséis permanecem iguais.

### Fora do escopo
- Card-título "Nossa Loja" (mantido).
- Carrosséis e grid de resultados (mantidos).
- Página `/admin/loja` (sem alterações).
