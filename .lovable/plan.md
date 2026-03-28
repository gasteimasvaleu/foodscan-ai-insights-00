

## Corrigir faixa branca do Tubelight Navbar

A faixa branca (linha 104) tem `rounded-t-3xl` que não deveria estar lá — originalmente era sem border-radius e ocupava toda a largura.

### Alteração

**`src/components/ui/tubelight-navbar.tsx`** (linha 104):

De:
```
<div className="absolute inset-x-0 -top-3 -bottom-2 bg-white rounded-t-3xl -z-10" />
```

Para:
```
<div className="absolute inset-x-0 -top-3 -bottom-2 bg-white -z-10" />
```

Remove o `rounded-t-3xl` para que a faixa branca fique reta no topo e ocupe toda a linha horizontal. O menu rosa não será alterado.

