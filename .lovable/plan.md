## Problema

O card do Apple Health no `HeroDeckRow` mostra `dailySteps` do `useHealthKit`, mas o hook não busca dados automaticamente — só o faz quando alguém chama `refreshData()` (ex: a página `/apple-health`). Por isso o valor fica em `0` na home.

Além disso, quando conectado, o card navega para `/fit-tracker` em vez de `/apple-health`, e o visual atual (rosa chapado `#FFD1E7`) pode ser refinado.

## Alterações em `src/components/HeroDeckRow.tsx`

1. **Buscar passos reais**: ao montar, se `isSupported && isConnected`, chamar `refreshData()` do hook para popular `dailySteps`. Adicionar `refreshData` ao destructuring.
2. **Rota quando conectado**: trocar o destino de `/fit-tracker` para `/apple-health` (sempre vai para Apple Health, conectado ou não).
3. **Background**: substituir `bg-[#FFD1E7]` por um gradiente vertical de rosa (topo) para branco (base) usando classes Tailwind: `bg-gradient-to-b from-[#FFD1E7] to-white`.
4. **Borda fininha**: adicionar `border border-[#FD46A1]/40` (rosa mais escuro do brand, com leve transparência para não pesar).
5. Manter o resto: `aspect-[4/5]`, conteúdo do estado conectado (anel + passos) e desconectado (imagem + botão "Conectar").

## Resultado esperado

- Card mostra os passos reais sincronizados com Apple Health.
- Toque sempre leva para `/apple-health`.
- Visual mais leve: degradê rosa→branco com fina borda rosa escura.
