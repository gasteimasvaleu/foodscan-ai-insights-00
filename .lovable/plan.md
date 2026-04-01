

## Substituir seletores de protocolo por WheelPicker com Drawer

### Alteração
**Editar**: `src/pages/IntermittentFasting.tsx`

1. **Imports**: Adicionar `Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle` e `WheelPicker`, além de `ChevronDown`.

2. **Estado**: Adicionar `isProtocolDrawerOpen` (boolean) e `pendingProtocol` (string) para controlar o drawer.

3. **Botão trigger**: Substituir o bloco de botões de protocolo (flex-wrap com chips) por um único botão branco com texto rosa "Selecionar Jejum" que abre o drawer. Estilo: `bg-white border-2 border-primary text-primary rounded-xl`.

4. **Drawer**: Adicionar um Drawer com o padrão glassmorphism existente (`bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl`), contendo:
   - `DrawerHeader` com título "Selecionar Protocolo"
   - `WheelPicker` com as opções de protocolo (16:8, 18:6, 20:4, OMAD, 14:10)
   - `DrawerFooter` com botões Cancelar e Confirmar

5. Mostrar o protocolo selecionado no botão trigger (ex: "16:8 selecionado").

### Arquivo
- **Editar**: `src/pages/IntermittentFasting.tsx`

