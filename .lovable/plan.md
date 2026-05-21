## Reorganizar card de entregador disponível

O card atual (`MFEntregadoresDisponiveis.tsx`, linhas 103–131) tem foto + nome/veículo/estrela + badge de preço + botão "Chamar" todos numa única linha horizontal — fica espremido no mobile (390px), principalmente o badge da faixa de preço encavalando o botão.

### Nova estrutura (2 linhas dentro do card)

```
┌──────────────────────────────────────────┐
│  [foto]  Nome do entregador              │
│          🛵 Moto  •  ⭐ 0.0              │
│  ────────────────────────────────────────│
│  [badge faixa de preço]    [  Chamar  ]  │
└──────────────────────────────────────────┘
```

- Aumentar foto de `w-10 h-10` para `w-12 h-12`.
- Topo (`flex items-center gap-3`): foto + bloco com nome (text-sm font-medium) e linha secundária com veículo • estrela (text-xs).
- Divider sutil (`border-t border-white/60`) ou apenas `pt-2 mt-1`.
- Rodapé (`flex items-center justify-between gap-2`): badge da faixa de preço à esquerda + botão "Chamar" à direita, ambos com mais respiro.
- Padding do card sobe para `p-3.5` e `space-y-2` interno.
- Botão "Chamar" mantém verde WhatsApp `#25D366`, `h-9 px-5 rounded-2xl`.

### Fora de escopo
Apenas o layout do `<li>`. Sem mudanças em dados, props, lógica de chamada ou outros componentes.
