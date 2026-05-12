## Objetivo

Reverter o layout do card "Diário de sono" (`src/components/maternidade/bebe/sleep/SleepDiaryAdvanced.tsx`) para manter os botões de ação ao lado direito do título, mas deixá-los menos espremidos.

## Alterações

1. **`SleepDiaryAdvanced.tsx`**
   - Voltar a usar `CardHeader` com layout `flex items-center justify-between`, com o título à esquerda e os botões à direita.
   - Remover a grid `grid-cols-2` que ocupava a largura total abaixo do título.
   - **Botão Iniciar/Parar**: manter apenas o ícone (`Play` quando parado, `Square` quando rodando), sem texto. Tamanho icon-only (`h-9 w-9 rounded-xl`), mantendo a cor `#FD46A1` ativa.
   - **Botão Registrar**: manter com texto + ícone, em tamanho compacto (`h-9 px-3 rounded-xl`).
   - Quando o timer estiver rodando, exibir o tempo decorrido logo abaixo do header (como já existia), em vez de dentro do botão.

## Fora do escopo

- Lógica de timer, persistência no Supabase e qualquer outra funcionalidade permanecem inalteradas (mudança puramente visual).
