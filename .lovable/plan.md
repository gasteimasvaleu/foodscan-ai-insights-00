## Espelhar exatamente o `HeroDeckRow`

A linha de cima (`HeroDeckRow`) usa este padrão:

- Grid: `grid-cols-[1.6fr_1fr]` (card grande à esquerda, pequeno à direita).
- Card **grande** (treino): imagem absoluta + um placeholder `invisible aspect-[5/4]` que dá altura à coluna.
- Card **pequeno** (passos): `aspect-[4/5]`.

Para a linha de baixo (`SecondaryDeckRow`) ficar com **a mesma altura e o mesmo comprimento**, basta espelhar — só inverter os lados, já que aqui o grande é o do gráfico (direita) e o pequeno é o da Loja (esquerda).

### Mudanças em `src/components/SecondaryDeckRow.tsx`

1. **Grid**: trocar para `grid-cols-[1fr_1.6fr]` (1fr esquerda = pequeno, 1.6fr direita = grande). Já está assim — manter.

2. **Card esquerdo (Loja, pequeno)** — espelho do card de passos do Hero:
   - `aspect-[4/5]` (mesmo do card de passos).
   - Remover o `h-full` que entrou na última edição.
   - Manter imagem absoluta cobrindo + pílula "Comprar" centralizada embaixo.

3. **Card direito (Balanço, grande)** — espelho do card de treino do Hero:
   - Remover `aspect-[16/9]` e remover `h-full`.
   - Adicionar um placeholder `invisible aspect-[5/4]` dentro do card para dar a mesma altura do card de treino.
   - Reorganizar o conteúdo (cabeçalho + gráfico + saldo) como **overlay absoluto** sobre esse placeholder, igual ao Hero faz com a thumb + faixa preta. Estrutura:
     - Wrapper `relative` com fundo gradiente + borda (já existe).
     - `<div className="invisible aspect-[5/4]" />` para fixar altura.
     - `<div className="absolute inset-0 flex flex-col p-3">` com:
       - Cabeçalho ("Últimos 7 dias" / "Balanço Calórico").
       - `<div className="flex-1 min-h-0">` com `ResponsiveContainer` + `BarChart`.
       - Rodapé com "Saldo" + valor.

   Assim o card direito fica com **exatamente a mesma altura** do card de treino acima (que usa `aspect-[5/4]` na coluna 1.6fr), e o card da Loja (`aspect-[4/5]` na coluna 1fr) fica **exatamente do mesmo tamanho** do card de passos.

### Resultado

As duas linhas (Hero e Secondary) ficam visualmente idênticas em altura e largura de cada coluna — só o conteúdo muda. A linha inferior vira um espelho horizontal da superior.

Sem mexer em lógica de dados nem em nenhum outro arquivo.
