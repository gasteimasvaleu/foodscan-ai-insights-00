

## Padronizar modal de deletar post

O modal atual em `PostCard.tsx` usa `<AlertDialogContent>` sem classes customizadas. Os outros modais do app seguem este padrao:

```
className="w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white/70 backdrop-blur-md border-2 border-primary shadow-xl"
```

### Mudanca

**`src/components/community/PostCard.tsx`** (linha 105):
- Adicionar as classes do padrao visual ao `AlertDialogContent`
- Estilizar o botao "Deletar" com fundo rosa primario (`bg-primary hover:bg-primary/90 text-white`) em vez de destructive, seguindo o padrao de botoes do app
- Estilizar o botao "Cancelar" com borda e cantos arredondados

