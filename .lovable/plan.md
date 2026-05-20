## Mudanças

**1. `src/App.tsx`**
Adicionar item "Alimentos" no array `navItems`, entre `MasterChef` e `Mais`:
```ts
{ name: 'Alimentos', url: '/alimentos', icon: Apple }
```
Importar `Apple` de `lucide-react`.

**2. `src/components/ui/tubelight-navbar.tsx`**
Reduzir gaps e padding para acomodar 7 ícones em 390px:
- `gap-2 sm:gap-3` → `gap-1 sm:gap-2`
- `px-3 sm:px-4` nos itens → `px-2 sm:px-3`
- Ícone `size={26}` → `size={24}` no mobile

Entrada antiga "Alimentos brasileiros" do `moreSheetItems` já foi removida na rodada anterior, então fica fora do menu +.

## Fora de escopo
- Botão "Buscar em alimentos brasileiros" em `/adicionar-refeicao` permanece.
- Sem mudanças em rotas, lógica ou estilos de outras páginas.
