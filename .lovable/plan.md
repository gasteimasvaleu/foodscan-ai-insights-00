## Ajustar largura e borda do modal "Acionar entrega"

O `DialogContent` em `src/pages/mercado-facil/LojistaPedidos.tsx` (linha 306) está sem a borda rosa e ocupando 100% da largura no mobile. Outros modais do Mercado Fácil (ex.: `LojistaProdutos.tsx` linha 188) seguem o padrão `max-w-md w-[calc(100%-2rem)] border-2 border-[#FD46A1]`.

### Mudança
Trocar a className do `DialogContent`:

De:
```
bg-white/70 backdrop-blur-md rounded-3xl max-h-[90vh] overflow-y-auto
```

Para:
```
bg-white/70 backdrop-blur-md rounded-3xl border-2 border-[#FD46A1] max-w-md w-[calc(100%-2rem)] max-h-[85vh] overflow-y-auto
```

### Fora de escopo
Nenhuma outra alteração — apenas largura, margem lateral e borda rosa do modal.
