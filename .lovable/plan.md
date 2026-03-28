

## Corrigir largura da faixa branca

O problema: a faixa branca (linha 104) usa `absolute inset-x-0`, mas está contida dentro do div pai que tem `max-w-[98vw]` e está centralizado. Por isso, a faixa branca herda essa largura limitada.

### Solução

Mover a faixa branca para **fora** do container do menu, como um elemento `fixed` independente que ocupa 100% da largura da tela.

**`src/components/ui/tubelight-navbar.tsx`** — linha 104:

De:
```
<div className="absolute inset-x-0 -top-3 -bottom-2 bg-white -z-10" />
```

Para:
```
<div className="fixed bottom-0 left-0 right-0 h-[calc(env(safe-area-inset-bottom)+4.5rem)] bg-white -z-10" />
```

Isso faz a faixa branca ser `fixed`, ocupar toda a largura (`left-0 right-0`), ancorada ao fundo da tela, com altura suficiente para cobrir o menu rosa + safe area. O menu rosa não será alterado.

