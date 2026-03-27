

## Corrigir 404 na página Receitas

O código está correto: o arquivo `src/pages/Receitas.tsx` existe, o import no `App.tsx` (linha 33) e a rota `/receitas` (linha 76) estão registrados corretamente.

O erro 404 provavelmente ocorre porque o preview ainda não refletiu as últimas alterações. A solução é simplesmente **forçar um rebuild** fazendo uma alteração mínima no `App.tsx` (ex: adicionar um comentário) para que o Vite recompile e a rota passe a funcionar.

### Ação
- Fazer uma edição trivial no `App.tsx` (adicionar/remover espaço ou comentário) para disparar o hot reload e resolver o 404.

