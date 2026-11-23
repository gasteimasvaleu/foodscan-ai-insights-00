# Tela /assinar dentro da regra 3.1.2(c) da Apple

## O que muda para quem vê a tela

**Cartão Anual**
- O preço principal passa a ser o valor cobrado de fato: "R$ 179,90/ano", em negrito, cor escura do texto, e é o maior preço da tela.
- Abaixo, menor e em cinza médio: "equivale a R$ 14,99/mês".
- Os selos "7 dias grátis" e "Economize X%" ficam pequenos, abaixo do preço. "Mais escolhido" continua no topo, sem números.

**Cartão Mensal**
- "R$ 49,90/mês" com o mesmo tamanho e peso do preço do anual.

**Botão**
- O botão diz sempre "Continuar", sem a palavra "grátis".
- Abaixo dele, um texto pequeno mas legível (cinza escuro):
  - Anual com teste: "7 dias grátis, depois R$ 179,90 por ano. Renova automaticamente. Cancele quando quiser."
  - Anual sem teste: "R$ 179,90 por ano. Renova automaticamente. Cancele quando quiser."
  - Mensal: "R$ 49,90 por mês. Renova automaticamente. Cancele quando quiser." (se o mensal tiver teste, usa o mesmo formato do anual)
- Todos os valores vêm do RevenueCat; nada fixo no código.

**Tamanhos**
- Preço principal com 20px; nenhum outro texto passa disso, exceto o logo/título. Botão, benefícios e nome do plano ficam em 16px ou menos; "equivale a" fica em 12px (60% de 20).

**iPad**
- Reduzo o espaço em cima e embaixo em telas grandes e deixo os cartões lado a lado, para os preços, o botão e o texto legal aparecerem sem rolar num iPad Air 11" (820x1180, em pé e deitado).

**Sem mudanças**: Restaurar compras, texto legal, entitlement "wediet Pro", fluxo de compra pelo servidor.

## Como vou conferir
- Print da tela com preços de exemplo (R$ 179,90 e R$ 49,90) no iPhone e no iPad Air 11", em pé e deitado, confirmando que o preço é o maior texto e que tudo aparece sem rolar.

## Detalhes técnicos
- Arquivo: `src/components/PaywallScreen.tsx` (PlanCard, botão, texto abaixo do botão, container).
- Preço principal `text-xl font-bold text-foreground`; equivalente `text-xs text-gray-600`; selos `text-[10px]`; texto abaixo do botão `text-xs text-gray-700`.
- Container: `md:pt-…`/`md:pb-…` menores e `md:items-center` para caber no iPad.
