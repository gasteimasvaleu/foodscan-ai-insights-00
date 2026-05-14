Hoje, em `src/components/community/StoriesCarousel.tsx`, ao clicar no próprio avatar:
- se o usuário **não tem** stories → abre o modal de criação;
- se o usuário **já tem** stories → abre o visualizador, sem opção de postar outro.

Plano:
1. Tornar o badge `+` (canto inferior direito do avatar do usuário) um elemento clicável independente que **sempre** chama `onAddStory()` — permitindo postar quantos stories quiser.
2. Manter o clique no avatar com o comportamento atual: ver os stories existentes (ou criar, caso não tenha nenhum).
3. Aumentar levemente o badge `+` para ser fácil de tocar (touch target adequado) e usar `stopPropagation` para não disparar o clique do avatar.

Sem mudanças no banco — `community_stories` já aceita múltiplos registros por usuário.