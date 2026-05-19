## Mudanças em `src/pages/ToAquiVenue.tsx`

1. **Remover** o botão de voltar atual (linhas 42-49) que está acima do card.

2. **Adicionar** o botão dentro do banner (no `div.relative.h-32`, linha 52), posicionado em `absolute top-3 left-3`, ao lado esquerdo da badge da categoria:
   - Quadradinho rosa: `bg-white/80 backdrop-blur-md` (mesmo estilo da badge), `rounded-full` (ou `rounded-xl` para "quadradinho"), `h-8 w-8`, ícone `ArrowLeft` em `#FD46A1`.
   - Estilo coerente com a badge da direita.

3. **Corrigir rota**: trocar `navigate(-1)` por `navigate("/to-aqui")` para garantir que sempre volte para a página principal do Tô Aqui (e não para o chat se o usuário veio de lá).
