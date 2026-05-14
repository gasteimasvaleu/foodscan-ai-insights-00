## Reduzir altura vertical do card do chat

**Arquivo:** `src/pages/NutriCoach.tsx`

Diminuir levemente a altura do card do chat para que a borda inferior rosa não fique escondida atrás do Navbar tubelight no app nativo.

- No container do card do chat (`bg-white border border-primary/20 ...`), trocar `flex-1` por `flex-1 mb-4` (ou aumentar a margem inferior em ~16px) para encurtar a altura visível do card sem mexer no `pb-28` do wrapper externo.

Sem outras mudanças visuais ou de comportamento.