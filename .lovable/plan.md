

## Post não aparece na comunidade

### Causa raiz
A query `supabase.from("community_posts").select("*, profiles:user_id(name, avatar_url)")` faz um join relacional, mas **não existe foreign key** entre `community_posts.user_id` e `profiles.id`. Sem essa FK, o PostgREST não consegue resolver o join e a query falha silenciosamente, retornando dados nulos ou erro.

### Solução

**1. Migration: adicionar foreign key**
```sql
ALTER TABLE public.community_posts
  ADD CONSTRAINT community_posts_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
```

Isso permite que o join `profiles:user_id(name, avatar_url)` funcione corretamente.

**2. Também adicionar FK nas tabelas relacionadas** (para que comentários e likes funcionem com joins futuros):
```sql
ALTER TABLE public.post_comments
  ADD CONSTRAINT post_comments_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;

ALTER TABLE public.post_likes
  ADD CONSTRAINT post_likes_post_id_fkey
  FOREIGN KEY (post_id) REFERENCES public.community_posts(id) ON DELETE CASCADE;
```

Nenhuma mudança no frontend é necessária — a query já está correta, só precisa da FK no banco.

