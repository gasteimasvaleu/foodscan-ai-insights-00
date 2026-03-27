

## Centralizar formulário de login verticalmente

### Problema
No app nativo iOS, o card de login está posicionado muito acima na tela.

### Mudança

**`src/components/AuthCard.tsx`** — Nos dois blocos de retorno (Native iOS e Web), o wrapper já usa `min-h-[calc(100vh-env(safe-area-inset-top)-6rem)] flex items-center`. Trocar para `min-h-[calc(100vh-env(safe-area-inset-top)-2rem)]` e adicionar `justify-center` para melhor centralização vertical, empurrando o card mais para o centro da tela.

Linhas ~95-96 (Native iOS) e ~180-181 (Web):
```
<div className="min-h-[calc(100vh-env(safe-area-inset-top)-2rem)] flex items-center justify-center">
```

Isso reduz a subtração de altura (de 6rem para 2rem), dando mais espaço e centralizando melhor o formulário.

