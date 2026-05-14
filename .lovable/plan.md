Plano para corrigir o problema real dos comentários:

1. Ajustar a lógica do card de postagem
- Garantir que o botão do balão de fala sempre abra a área de comentários para qualquer usuário logado, independente de ser autor ou não.
- Separar claramente a ação de comentar da ação de DM, para nenhum botão/menu interferir no clique do balão.
- Se houver erro ao carregar comentários, manter a área aberta e mostrar mensagem de erro em vez de parecer que “não abriu”.

2. Ajustar a política do banco para comentários
- Atualizar a regra de `post_comments` para permitir que qualquer usuário autenticado comente em qualquer postagem existente da comunidade.
- Manter segurança: o comentário só poderá ser criado com `user_id` igual ao usuário logado.
- Manter que usuários só possam editar/apagar os próprios comentários.

3. Melhorar feedback e contagem
- Após comentar, recarregar os comentários e atualizar a lista visualmente.
- Se a criação falhar por permissão, exibir um aviso claro: “Você precisa estar logado para comentar” ou a mensagem real do banco.

Detalhes técnicos:
- Revisar `src/components/community/PostCard.tsx` e `src/components/community/CommentSection.tsx`.
- Criar/ajustar uma migration de RLS para `public.post_comments` com uma regra de criação baseada em `auth.uid() = user_id` e existência do `post_id` em `community_posts`.
- Não alterar o fluxo de DM nem stories.