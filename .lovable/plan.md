## Comunidade estilo Instagram

Transformar `/comunidade` em um feed vertical estilo Instagram com Stories de 24h e DMs 1-a-1.

### 1. Banco de dados (nova migration)

**Stories (expiram em 24h)**
- `community_stories`: `user_id`, `image_url`, `storage_path`, `expires_at` (default `now() + 24h`).
- `community_story_views`: `story_id`, `viewer_id`, `viewed_at` — para mostrar aro colorido só em quem ainda não foi visto.
- RLS: qualquer autenticado lê stories ainda não expirados; usuário só insere/deleta os próprios; views só do próprio viewer.
- Cron diário (`pg_cron`) opcional para limpar registros vencidos.

**DMs 1-a-1**
- `dm_conversations`: `user_a` e `user_b` (ordenados por uuid asc para garantir unicidade), `last_message_at`.
  - Constraint única em (`user_a`, `user_b`).
- `dm_messages`: `conversation_id`, `sender_id`, `content` (text, nullable), `image_url` (nullable), `read_at` (nullable).
- RLS: SELECT/INSERT/UPDATE liberados apenas para `auth.uid() in (user_a, user_b)` da conversa.
- Função `get_or_create_dm_conversation(_other_user uuid)` SECURITY DEFINER que devolve o id da conversa entre o usuário logado e `_other_user`.
- Trigger em `dm_messages` para atualizar `last_message_at` da conversa.
- Realtime habilitado em `dm_messages` e `community_stories`.

**Storage**
- Reaproveitar bucket `community-images` para fotos do feed.
- Novo bucket público `community-stories` para fotos de Stories.
- Novo bucket privado `dm-media` para anexos das DMs (acesso só dos dois participantes via RLS no `storage.objects`).

**post_likes / post_comments**: já existem, sem mudança de schema.

### 2. Refatorar o feed (`Comunidade.tsx`)

- Trocar o `PostForm` "antes/depois" por um botão flutuante `+` que abre um modal de novo post com:
  - upload de **uma única foto** (`community_posts.before_photo_url` reaproveitado como foto principal; `after_photo_url` deixa de ser usado nos novos posts).
  - campo `description` (legenda).
- `PostCard` redesenhado estilo IG:
  - header: avatar + nome + tempo + menu (...).
  - imagem quadrada full-width.
  - barra de ações: ❤️ comentário ✈️ (DM share opcional) e 🔖.
  - "X curtidas" + legenda inline + "Ver todos os N comentários" expansível.
- Remover botão grande "Chat ao vivo" do topo; substituir por ícone de avião/DM no header da página, ao lado do título "Comunidade".

### 3. Carrossel de Stories (topo do feed)

- Componente `StoriesCarousel`:
  - Avatar do usuário ativo **fixo à esquerda** com botão `+` para criar story; rola horizontalmente os demais.
  - Aro gradiente (rosa/laranja) quando há story ainda não visualizado pelo usuário; aro cinza quando já visto; sem aro quando o próprio usuário não tem story.
- Componente `StoryViewer` (modal fullscreen):
  - Imagem + barra de progresso (5s por story), tap esquerda/direita para navegar, swipe down para fechar.
  - Marca `community_story_views` ao abrir cada story.
  - Mostra "responder via DM" no rodapé → abre conversa com o autor.

### 4. DMs

- Nova rota `/comunidade/dm` (lista de conversas) e `/comunidade/dm/:conversationId` (thread).
- `DMList`: lista as conversas do usuário ordenadas por `last_message_at`, mostra avatar + nome + última mensagem + indicador de não-lido.
- `DMThread`: bolhas alinhadas (próprias à direita rosa, do outro à esquerda branco), input com botão de anexar foto, realtime via `postgres_changes` em `dm_messages` filtrado por `conversation_id`.
- Botão "Mensagem" no `PostCard` (menu ...) e no `StoryViewer` chama `get_or_create_dm_conversation` e navega para a thread.

### 5. Roteamento e navegação

- Adicionar rotas em `src/App.tsx`: `/comunidade/dm`, `/comunidade/dm/:id`.
- Manter `/comunidade/chat` (global) acessível apenas via Menu Mais; ele sai do topo da Comunidade.

### 6. Detalhes técnicos

- Realtime: assinaturas em `community_stories` (INSERT/DELETE) para atualizar carrossel; em `dm_messages` por conversa para atualizar thread.
- Cleanup: ao deletar story/post/DM com mídia, remover o objeto do storage no client após DELETE (best effort).
- Compressão de imagens reusa `src/lib/imageCompression.ts` antes do upload.
- Acessibilidade: `aria-label` nos botões de like/comentário/DM, alt nas imagens.
- Performance: paginação do feed em blocos de 20 com "carregar mais" via IntersectionObserver.

### 7. Memórias a atualizar após implementação

- `mem://features/community/instagram-feed` (novo) — feed vertical, stories 24h, DMs 1-a-1, buckets usados.
- Atualizar `mem://features/chat/global-realtime` para refletir que o chat global sai do topo da `/comunidade`.

### Diagrama de telas

```text
/comunidade
 ├─ Header [Comunidade]  [✈ DMs]
 ├─ StoriesCarousel  [eu+] [user1] [user2] ...
 └─ Feed vertical
      └─ PostCard (avatar | imagem | ações | curtidas | legenda | comentários)

/comunidade/dm           → lista de conversas
/comunidade/dm/:id       → thread realtime
```
