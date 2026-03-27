

## Criar página /comunidade

### Contexto
As tabelas `community_posts`, `post_comments` e `post_likes` já existem no banco com RLS configurado. O bucket `avatars` existe para fotos de perfil. Precisamos de um bucket para imagens da comunidade.

### Mudanças

**1. Criar bucket de storage `community-images`**
- Bucket público para imagens postadas na comunidade
- RLS para upload apenas por usuários autenticados

**2. Criar `src/pages/Comunidade.tsx`**
- Feed de posts com scroll infinito ou paginação simples
- Formulário para criar post (texto + imagem opcional via upload)
- Cada post mostra: avatar do autor, nome, data, descrição, imagem (se houver), botões de curtir e comentar
- Seção de comentários expansível por post
- Botão de curtir com contagem (toggle like/unlike)
- Join com `profiles` para exibir nome e avatar do autor

**3. Criar componentes auxiliares**
- `src/components/community/PostCard.tsx` — card individual do post
- `src/components/community/PostForm.tsx` — formulário de novo post
- `src/components/community/CommentSection.tsx` — lista de comentários + input para novo comentário

**4. Adicionar rota e navegação**
- Rota `/comunidade` em `App.tsx`
- Adicionar "Comunidade" no menu `moreSheetItems` do `tubelight-navbar.tsx`

### Detalhes técnicos

- Posts buscados via `supabase.from('community_posts').select('*, profiles(name, avatar_url)')` ordenados por `created_at desc`
- Likes controlados via `post_likes` — verificar se user já curtiu para toggle
- Comentários via `post_comments` com join em `profiles`
- Upload de imagens para bucket `community-images` usando padrão similar ao `uploadToSupabase`
- Campos `before_photo_url` e `after_photo_url` já existem na tabela — usar `before_photo_url` como campo de imagem principal do post (ou ambos para posts de transformação)
- Proteger página com `useAuth` — redirecionar para `/auth` se não logado

