
Objetivo: ocultar a barra de rolagem do Wheel Picker sem perder o gesto de arrastar com o dedo.

1) Ajuste no componente
- Atualizar `src/components/ui/wheel-picker.tsx` para remover dependência de `scrollbar-none` e aplicar uma classe dedicada (ex.: `wheel-picker-scroll`) no container rolável.
- Manter `overflow-y-auto`, `touch-pan-y`, `scrollSnapType` e lógica atual de snap/teclado exatamente como estão.

2) CSS cross-browser (escopo local)
- Em `src/index.css`, criar utilitário específico para esse picker:
  - `scrollbar-width: none;` (Firefox)
  - `-ms-overflow-style: none;` (legacy Edge/IE)
  - `::-webkit-scrollbar { width: 0; height: 0; display: none; }` (WebKit/Chrome/Safari)
- Escopo só para a classe do Wheel Picker, para não impactar outras áreas que precisam de scrollbar visível.

3) Compatibilidade com seu padrão atual
- Preservar a regra global existente de esconder scroll apenas em `display-mode: standalone`.
- O novo utilitário garante que, no wheel, a barra também fique escondida no preview/web normal (como você pediu), mas com rolagem por toque funcionando.

4) Validação
- Testar no fluxo `/profile/workout`:
  - abrir modal de adicionar exercício,
  - rolar “Séries” e “Repetições” com o dedo,
  - confirmar ausência visual da barra e snap no item central.
- Validar também navegação por teclado (setas/Home/End) para não regredir acessibilidade.
