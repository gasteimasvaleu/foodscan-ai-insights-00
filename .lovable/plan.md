## Objetivo
O botão "+" está vazando para fora da navbar inferior. Reduzir levemente o espaçamento entre os itens para que tudo caiba dentro da área.

## Alterações em `src/components/ui/tubelight-navbar.tsx`

1. **Container externo (linha 110)**: trocar `gap-2 sm:gap-3` por `gap-0.5 sm:gap-2` e reduzir padding lateral `px-2 sm:px-3` → `px-1.5 sm:px-2`.
2. **Wrapper interno dos itens (linha 131)**: trocar `gap-2 sm:gap-3` por `gap-0.5 sm:gap-2`.
3. **Botões/links (linhas 142 e 160)**: reduzir padding horizontal `px-3 sm:px-4` → `px-2 sm:px-3`, mantendo `min-h-[44px]` / `min-w-[44px]` para acessibilidade.

Sem alterações de lógica, ícones, ordem ou comportamento — apenas espaçamento.