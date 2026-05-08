## Problema visto no print

No iOS nativo, a linha "Loja + Balanço Calórico" ficou desbalanceada:

- O card **Loja** ficou minúsculo (parece um ícone solto à esquerda), porque o `grid-cols-[1fr_1.6fr]` dá pouca largura à coluna esquerda e o `aspect-[4/5]` colapsa essa coluna numa caixinha pequena.
- O card **Balanço Calórico** ficou só com cabeçalho + saldo, **sem o mini gráfico aparecendo**, porque ele não tem altura própria (`h-full`) — e como o card da esquerda virou um quadradinho pequeno, o card direito herdou essa altura mínima e o `ResponsiveContainer` do Recharts colapsou para 0.

Ou seja: a linha inteira ficou sem altura porque nenhum dos dois cards define uma altura real, só o esquerdo tinha `aspect-[4/5]` numa coluna estreita demais.

## Correção em `src/components/SecondaryDeckRow.tsx`

1. **Inverter a proporção do grid** para espelhar o `HeroDeckRow` (lá o card grande é à esquerda com `1.6fr` e o pequeno à direita com `1fr`). Aqui o card grande é o da direita (gráfico), então mantemos `grid-cols-[1fr_1.6fr]` — mas garantimos altura via o card grande.

2. **Dar altura real à linha pelo card direito** (o do gráfico), usando `aspect-[16/9]` nele em vez de `h-full`. Assim o card direito define a altura da linha e o esquerdo (`h-full` + `aspect` removido) acompanha.

   - Card direito: trocar `h-full` por `aspect-[16/9]` (espelha o "16:9 com gráfico" pedido originalmente).
   - Card esquerdo (Loja): remover `aspect-[4/5]` e usar `h-full` para acompanhar a altura do card direito, mantendo a imagem com `object-cover` preenchendo todo o espaço.

3. **Garantir que o mini gráfico apareça**: com a linha agora tendo altura real (vinda do `aspect-[16/9]` do card direito), o `flex-1 min-h-0` + `ResponsiveContainer` do Recharts passa a renderizar normalmente as barras.

4. **Padding interno do card direito**: manter `p-3`, mas como `aspect-[16/9]` é baixo, conferir que o cabeçalho (2 linhas pequenas) + gráfico + rodapé do saldo cabem. Se ficar apertado, reduzir o cabeçalho para uma linha só ("Balanço 7 dias") e diminuir margens verticais (`mt-1` → `mt-0.5`).

Nada de mudar lógica de dados, só layout.

## Resultado esperado

- Card **Loja** com altura cheia da linha, imagem de fundo cobrindo tudo e o pílula "Comprar" centralizada embaixo (igual ao card "Conectar" do Apple Health).
- Card **Balanço Calórico** em formato 16:9 ao lado, com o mini gráfico de barras (consumido vs queimado) visível e o saldo no rodapé.
- Linha visualmente equivalente em peso à linha Hero (treino + passos) logo acima.
