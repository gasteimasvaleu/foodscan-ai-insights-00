

## Adicionar card "Treinos" e subir o menu Tubelight

### Alterações

**1. `src/components/QuickActions.tsx`**
- Adicionar import do ícone `Dumbbell` do lucide-react
- Inserir novo card "Treinos" entre "Gerar Cardápio" e "WhatsApp" (ou ao final), com:
  - `icon: Dumbbell`
  - `title: "Treinos"`
  - `tags: ["Vídeos", "Exercícios"]`
  - `path: "/treinos"`
  - `color: "#FA1690"` (alternar cores)
- Ajustar cores alternadas para manter o padrão com 5 cards
- Aumentar `marginBottom` negativo de `-48px` para `-64px` para que o conjunto maior de cards alcance a faixa branca

**2. `src/components/ui/tubelight-navbar.tsx`**
- Alterar o padding bottom de `pb-[calc(8px+env(safe-area-inset-bottom))]` para `pb-[calc(14px+env(safe-area-inset-bottom))]`
- Subir o menu adicionando `bottom-2` em vez de `bottom-0`

