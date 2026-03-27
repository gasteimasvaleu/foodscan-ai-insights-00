

## Corrigir navegação e input do NutriCoach

### Problemas
1. O NutriCoach foi adicionado diretamente no Tubelight Navbar, removendo o botão "+" (Mais). Deveria estar dentro do sheet do "+"
2. O textarea de input está escondido atrás da faixa branca e do Tubelight menu

### Mudanças

1. **`src/App.tsx`** — Remover o item `NutriCoach` do array `navItems`, mantendo apenas os 7 itens originais + "Mais"

2. **`src/components/ui/tubelight-navbar.tsx`** — Adicionar o NutriCoach ao array `moreSheetItems`:
   ```ts
   { name: "NutriCoach", description: "Chat com IA de nutrição e treinos", url: "/nutri-coach", icon: MessageCircle }
   ```

3. **`src/pages/NutriCoach.tsx`** — Ajustar o padding inferior da área de mensagens e do input para não ficar atrás do menu:
   - Área de mensagens: adicionar `pb-32` para compensar o input + tubelight
   - Input area: mudar para `fixed bottom-0 left-0 right-0` com `pb-[calc(5rem+env(safe-area-inset-bottom))]` para ficar acima do Tubelight menu e da faixa branca

