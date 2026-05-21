## Mudança

No card do pedido em `src/pages/mercado-facil/LojistaPedidos.tsx` (linha ~200), exibir `p.cliente_nome` logo abaixo da data e antes de "X itens".

```tsx
<p className="text-xs text-foreground/60">{data...}</p>
{p.cliente_nome && (
  <p className="text-sm font-semibold text-foreground">{p.cliente_nome}</p>
)}
<p className="text-base font-semibold">{p.itens.length} itens</p>
```

Campo `cliente_nome` já existe em `OrderLog` e já vem do banco — apenas não está sendo renderizado. Fallback silencioso quando nulo (pedidos antigos).

Sem mudanças em DB, queries ou outros componentes.
