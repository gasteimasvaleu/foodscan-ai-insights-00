
## Diagnóstico

Não: a publicação não está esperando autorização do admin.

Pelo que eu verifiquei:
- suas publicações estão sendo salvas no banco (`community_posts` já tem os posts `teste`)
- não existe campo/status de aprovação nem lógica de moderação nas policies
- a policy de leitura de `community_posts` é pública (`USING (true)`)

A causa mais provável é outra: o feed da página usa esta query relacional:

```ts
.select("*, profiles:user_id(name, avatar_url)")
```

Mas no banco ao vivo ainda não existe a foreign key que liga `community_posts.user_id` com `profiles.id`. Sem essa relação, o PostgREST não consegue montar o join corretamente. Como o código atual não trata `error` em `fetchPosts`, a tela acaba ficando como se não houvesse posts.

## Plano de correção

### 1. Corrigir a relação no Supabase
Criar migration para adicionar a FK faltante:

```sql
ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

Vou aproveitar e alinhar o mesmo padrão para comentários, porque `CommentSection` usa a mesma ideia de join com `profiles:user_id(...)`:
```sql
ALTER TABLE public.post_comments
  ADD CONSTRAINT post_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

### 2. Deixar o frontend menos “silencioso”
Em `src/pages/Comunidade.tsx`:
- capturar `error` em `fetchPosts`
- não tratar erro como lista vazia
- exibir toast ou fallback claro quando a busca falhar

Em `src/components/community/CommentSection.tsx`:
- aplicar o mesmo tratamento em `fetchComments`

### 3. Validar o fluxo
Depois da correção:
- publicar um novo post
- confirmar que ele aparece imediatamente no feed
- recarregar a página para garantir que continua visível
- abrir comentários para confirmar que nomes/avatar também carregam

## Detalhe técnico importante

A migration anterior adicionou apenas:
- `post_comments.post_id -> community_posts.id`
- `post_likes.post_id -> community_posts.id`

Ela não adicionou a relação principal que o feed precisa:
- `community_posts.user_id -> profiles.id`

Por isso o problema persiste mesmo após aquela alteração.
