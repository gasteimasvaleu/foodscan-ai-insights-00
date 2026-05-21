# Migrar Músicas do YouTube para Upload de MP3

Trocar o player do YouTube por um player nativo que toca arquivos MP3 enviados pelo admin. Cada playlist passa a ter N faixas em sequência.

## Mudanças no banco

**Novo bucket `musicas-audio` (público)** para os MP3.

**Nova tabela `musicas_faixas`** (faixas dentro de uma playlist):
- `id uuid pk`
- `playlist_id uuid` → `playlists_musicas(id) on delete cascade`
- `titulo text`
- `audio_url text` (URL pública no bucket)
- `duracao_segundos int null` (opcional, preenchido no upload via `<audio>.duration`)
- `ordem int default 0`
- `created_at timestamptz default now()`
- RLS: SELECT público (is_active da playlist), INSERT/UPDATE/DELETE só admin via `has_role`.

**`playlists_musicas`**: manter a tabela e os campos `titulo`, `descricao`, `categoria`, `thumbnail_url`, `ordem`, `is_active`. Os campos `youtube_id` e `youtube_type` ficam como nullable (legado, não usados mais na UI). Sem migração destrutiva.

## Admin (`/admin/musicas`)

Reformular `AdminMusicas.tsx`:
- Form da playlist mantém: título, descrição, categoria, capa (upload no bucket `musicas-capas`), ordem, ativa. Remove campos `youtube_id` e `youtube_type` e o seletor de tipo.
- Após salvar a playlist, abre uma seção **"Faixas"** dentro do mesmo dialog (ou um segundo dialog) com:
  - Lista das faixas existentes (título + duração + botões reordenar ↑↓ + apagar).
  - Botão **"Adicionar faixas"** que aceita múltiplos MP3 de uma vez. Para cada arquivo:
    - upload pra `musicas-audio/{playlist_id}/{timestamp}-{rand}.mp3`
    - lê duração via `new Audio(url).onloadedmetadata`
    - insere em `musicas_faixas` com `titulo = nome do arquivo sem extensão`, `ordem = max+1`
  - Cada faixa pode ter o título editado inline.
- Card da listagem mostra contagem de faixas em vez de "Playlist/Vídeo".

## UI do usuário (`/musicas`)

- `PlaylistCard` continua igual (usa `thumbnail_url`; sem fallback de thumb do YouTube — se vazio, ícone Music).
- Ao abrir o modal de player, substituir o `VinylPlayer` baseado em YouTube por um **AudioPlayer nativo** (`<audio>` HTML5):
  - Visual mantém o disco de vinil girando enquanto toca (animação CSS atual).
  - Controles: play/pause grande, prev/next, barra de progresso scrubável, tempo atual / total, volume opcional.
  - Lista de faixas embaixo (clicável pra pular).
  - Autoplay da próxima faixa ao terminar.
  - Funciona 100% offline-do-YouTube → resolve o problema do iOS nativo de uma vez. WKWebView toca MP3 inline sem restrição (já temos `allowsInlineMediaPlayback`).

## Arquivos afetados

- **Migration**: criar bucket `musicas-audio` + tabela `musicas_faixas` + policies.
- **`src/pages/AdminMusicas.tsx`**: remover campos YouTube, adicionar gerenciador de faixas com upload múltiplo.
- **`src/components/musicas/PlaylistCard.tsx`**: remover `getYouTubeThumb`, simplificar pra usar só `thumbnail_url`.
- **`src/components/musicas/VinylPlayer.tsx`**: trocar iframe YouTube por `<audio>` + UI de player, mantendo a animação do disco.
- **`src/components/musicas/YouTubePlayer.tsx`**: deletar (não usado mais).
- **`public/youtube-embed.html`**: deletar (não usado mais).
- **`src/pages/Musicas.tsx`**: nenhuma mudança estrutural, só passar as faixas pro player.

## Detalhes técnicos

- Upload com `supabase.storage.from('musicas-audio').upload(...)` com `contentType: 'audio/mpeg'`.
- Aceita `audio/mpeg, audio/mp3` no `<input accept>`. Sem limite de tamanho explícito (Supabase default é 50MB por arquivo — se precisar maior, ajustar no painel).
- Reordenar faixas = update em batch do campo `ordem`.
- Player usa `useRef<HTMLAudioElement>` e estado React pra `currentTime`, `duration`, `isPlaying`, `currentIndex`.

## Memória

Atualizar `mem://features/musicas/core` pra refletir: agora é upload de MP3 com player nativo, não mais YouTube.
