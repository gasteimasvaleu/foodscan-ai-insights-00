## Objetivo
Permitir upload de **vídeos curtos** nos Stories (até 15s, 30 MB) e no Feed (até 60s, 50 MB) da Comunidade, com autoplay estilo Reels e thumbnail gerada do 1º frame.

## 1. Banco de dados — `supabase--migration`

**Bucket novo `community-videos`** (público, MIME mp4/quicktime/webm, 50 MB max).
RLS: leitura pública; INSERT/DELETE só do dono (path prefixado por `auth.uid()/...`).

**`community_posts`** — adicionar:
- `media_type` text default `'image'` (`'image' | 'video'`)
- `video_url` text nullable
- `video_storage_path` text nullable
- `video_poster_url` text nullable (thumbnail JPG gerado do 1º frame, salvo no `community-images`)
- `video_duration_seconds` numeric nullable

**`community_stories`** — adicionar as mesmas 5 colunas (`media_type`, `video_url`, `video_storage_path`, `video_poster_url`, `video_duration_seconds`). `image_url` continua obrigatório → será preenchido com a URL do **poster** quando for vídeo, mantendo retrocompatibilidade do feed de stories.

## 2. Helpers de mídia (novos)

`src/lib/videoUtils.ts`:
- `getVideoMetadata(file)` → `{ duration, width, height }` via `<video>` invisível
- `extractFirstFrame(file)` → `Blob` JPEG (canvas, 720p max, qualidade 0.8)
- `validateVideo(file, maxSeconds, maxMB)` → throws com mensagem amigável

## 3. CreateStoryModal

- Toggle "Foto / Vídeo" no topo
- Quando vídeo: `accept="video/mp4,video/quicktime,video/webm"`, valida ≤ **15s** e ≤ **30 MB**
- Preview com `<video controls muted playsInline>` (vertical 9:16)
- Submit:
  1. extrai 1º frame → upload no `community-images` como `poster.jpg`
  2. upload do vídeo no `community-videos`
  3. insert em `community_stories` com `media_type='video'`, `video_url`, `video_poster_url`, `video_duration_seconds`, e `image_url = poster_url` (compat)

## 4. CreatePostModal

Mesma lógica, limites: ≤ **60s**, ≤ **50 MB**, `aspect square` mantido para foto, `aspect-[4/5]` para vídeo (vertical-friendly).

## 5. Renderização

**`PostCard`** — quando `media_type === 'video'`:
- Renderiza `<video>` com `muted`, `loop`, `playsInline`, `preload="metadata"`, `poster={video_poster_url}`
- `IntersectionObserver` (threshold 0.6) → autoplay quando ≥60% visível, pausa fora; estilo Reels
- Tap único = play/pause + toggle mute (ícone overlay)
- Double-tap continua dando like

**`StoryViewer`** — quando vídeo:
- Renderiza `<video autoPlay muted playsInline>` no lugar do `<img>`
- Duração da barra de progresso = `video.duration` em vez de `STORY_DURATION` (5s)
- Pause/resume tap-hold pausa o `<video>` também
- `next()` chamado em `onEnded`

## 6. UX & validação
- Toast claro ("Vídeo muito longo: 18s, máximo 15s")
- Loading state com `Loader2` durante upload (vídeos demoram mais)
- Feedback de progresso opcional via `XMLHttpRequest` é fora do escopo desta v1 — só `Loader2` rodando
- Mute por padrão (regra de autoplay iOS/Safari)

## 7. Segurança
- Validação dupla: client (duração + tamanho) e RLS de storage por `auth.uid()` no path
- MIME types restritos no bucket
- Sem mudança em policies das tabelas (já permitem owner-only INSERT/DELETE)

## Fora do escopo
- Compressão/transcoding server-side (subir como veio)
- Edição de vídeo (trim, filtros)
- Stories com múltiplos vídeos por postagem
- Feed de DMs (vídeo nas mensagens)