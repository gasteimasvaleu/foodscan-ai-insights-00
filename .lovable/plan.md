## Ajuste do menu Tubelight

No `src/components/ui/tubelight-navbar.tsx`, no container fixo:

1. **Posição mais baixa**: trocar `bottom-2` por `bottom-0` (ou `-bottom-1`) — encosta mais na base, aproveitando a safe-area do iPhone real.
2. **Tamanho maior dos ícones e toques**:
   - Ícones de `size={26}` → `size={30}`, `strokeWidth` mantido em `2.5`.
   - Botões: `px-2.5 sm:px-3 py-3 sm:py-2` → `px-3 sm:px-3.5 py-3.5 sm:py-2.5`, `min-h-[44px] min-w-[44px]` → `min-h-[52px] min-w-[52px]`.
   - Container: `py-2 px-2 sm:px-2.5` → `py-2.5 px-2.5 sm:px-3`, `rounded-2xl` mantido.
   - Gap entre itens: `gap-1 sm:gap-2` → `gap-1.5 sm:gap-2.5`.

Nada mais é alterado — só ajustes visuais de tamanho/posição.