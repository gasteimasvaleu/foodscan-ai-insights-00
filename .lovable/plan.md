## Ajuste de largura do modal "Dica misteriosa via IA"

Os dois `DialogContent` em `src/pages/ToAquiChat.tsx` (linhas 420 e 514) usam apenas `max-w-sm`, sem `w-[calc(100%-2rem)]`, o que faz o modal ocupar toda a largura horizontal no mobile (390px), fora do padrão do app.

### Mudança
Atualizar a className dos dois `DialogContent` para o padrão usado nos outros modais do app:

```
w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl
```

Aplicar em:
- Linha 420 — modal de interações (caso exista um Dialog ali também)
- Linha 514 — modal "Dica misteriosa via IA"

Resultado: margens laterais de 1rem, largura máxima 28rem, borda rosa e glassmorphism consistentes com `WidgetPromoModal`, `AddObjectiveModal`, etc.