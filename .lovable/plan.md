
## Diagnóstico

O erro do screenshot confirma que o problema não é moderação/admin approval.

A causa real é esta:
- hoje já existe uma constraint chamada `community_posts_user_id_fkey`
- mas ela aponta para `auth.users(id)`, não para `public.profiles(id)`
- a tela usa o join relacional `profiles:user_id(name, avatar_url)`
- o PostgREST só consegue resolver esse join quando a relação aponta para `profiles`

Também encontrei o mesmo padrão incorreto em comentários e likes:
- `post_comments.user_id -> auth.users(id)`
- `post_likes.user_id -> auth.users(id)`

## Por que a migration anterior não resolveu

A migration foi escrita com `IF NOT EXISTS` usando o nome:
- `community_posts_user_id_fkey`
- `post_comments_user_id_fkey`

Como essas constraints já existiam com esse mesmo nome, o SQL não recriou nada. Ou seja: o nome existia, mas o destino da FK continuou errado.

## Plano de correção

### 1. Corrigir as foreign keys existentes no banco
Em vez de “adicionar se não existir”, a correção precisa:
- remover as FKs atuais que apontam para `auth.users`
- recriar apontando para `public.profiles(id)`

Estrutura da correção:
```sql
ALTER TABLE public.community_posts
  DROP CONSTRAINT IF EXISTS community_posts_user_id_fkey;

ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_comments
  DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;

ALTER TABLE public.post_comments
  ADD CONSTRAINT post_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes
  DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

### 2. Manter o frontend com tratamento de erro
O tratamento de erro já adicionado em:
- `src/pages/Comunidade.tsx`
- `src/components/community/CommentSection.tsx`

deve continuar, porque agora ele mostra exatamente esse tipo de falha em vez de esconder o problema.

### 3. Validar o fluxo completo
Depois da migration correta:
- abrir `/comunidade`
- publicar um novo post
- confirmar que o post aparece sem recarregar
- recarregar a página e confirmar persistência
- abrir comentários para validar nome/avatar
- testar like para garantir que nada quebrou nas relações auxiliares

## Detalhe técnico importante

Usar `auth.users` como referência nesses fluxos do frontend não é o ideal aqui, porque o app consulta `profiles` no schema público. Como já existe `handle_new_user()` criando `profiles`, o relacionamento certo para a comunidade é com `public.profiles(id)`.

Se eu for implementar, a próxima ação correta é ajustar a migration para substituir as FKs erradas, não apenas tentar criar novas com o mesmo nome.
