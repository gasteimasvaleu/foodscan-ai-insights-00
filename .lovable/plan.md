Vou corrigir o conflito visual no `/desafio-14-dias` reduzindo a distância inferior do sticky action bar para ele voltar a ficar acima do menu tubelight, mas sem sobrepor o botão “Salvar rascunho e voltar depois”.

Plano:
1. Alterar o `bottom` do sticky action bar de `calc(env(safe-area-inset-bottom) + 7rem)` para um valor intermediário mais baixo.
2. Adicionar um pequeno padding inferior no conteúdo principal da página, se necessário, para garantir que o último botão não fique escondido atrás do sticky bar/menu.
3. Manter o design atual do card sticky intacto, mudando apenas espaçamento/posicionamento.