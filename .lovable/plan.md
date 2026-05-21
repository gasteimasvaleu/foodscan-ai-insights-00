## Página de Músicas (`/musicas`) com YouTube

Nova página dedicada estilo "Spotify-like" dentro do We Diet, com playlists curadas por categoria (Foco, Relaxar, Treino, Refeição Consciente, Sono) tocando via **YouTube IFrame Player API** — gratuito, sem login, funciona web + iOS nativo.

## Por que YouTube e não Spotify

- Spotify Web Playback SDK só toca música completa para usuários **Premium logados** — exclui a maioria dos seus usuários.
- YouTube IFrame é gratuito, sem login, e tem praticamente qualquer música/playlist (lo-fi, meditação, treino).
- Sem custo de API enquanto não usarmos busca dinâmica (playlists ficam pré-cadastradas).

## Estrutura

### Banco de dados (nova tabela `playlists_musicas`)

Cadastrada e gerenciada pelo admin (você), igual ao padrão de `/admin/loja` e `/admin/alimentos-comunidade`.

Campos:
- `id`, `created_at`, `updated_at`
- `titulo` (text) — ex.: "Lo-fi para focar no trabalho"
- `descricao` (text, nullable)
- `categoria` (text) — ex.: 'foco', 'relaxar', 'treino', 'refeicao', 'sono'
- `youtube_playlist_id` (text) ou `youtube_video_id` (text) — um dos dois
- `thumbnail_url` (text, nullable) — capa custom; default usa thumb do YouTube
- `ordem` (int, default 0) — para ordenação dentro da categoria
- `is_active` (bool, default true)

RLS:
- SELECT público (qualquer usuário autenticado vê playlists ativas)
- INSERT/UPDATE/DELETE só para `has_role(auth.uid(), 'admin')`

### Rotas

- **`/musicas`** — página do usuário: carrosséis por categoria (mesma vibe do `/loja`), cada card mostra capa + título. Clicou → abre modal/tela com player do YouTube embedded tocando a playlist.
- **`/admin/musicas`** — CRUD para você cadastrar playlists (ID do YouTube, categoria, ordem).

### Entrada no app

Item no **Menu +** (bottom plus menu), seguindo o padrão de Loja, Mercado Fácil, Quiz, etc.

### Componentes

- `src/pages/Musicas.tsx` — listagem por categoria com carrosséis
- `src/pages/admin/AdminMusicas.tsx` — CRUD
- `src/components/musicas/YouTubePlayer.tsx` — wrapper do IFrame Player API (carrega script, controla play/pause/próxima)
- `src/components/musicas/PlaylistCard.tsx` — card com capa, título, badge da categoria

### Player

- Modal fullscreen com IFrame YouTube embedado, autoplay ao abrir.
- Controles nativos do YouTube (play/pause, próxima, volume).
- Header da modal mostra título da playlist + botão fechar (rosa #FD46A1, padrão do app).
- No iOS Capacitor: o player roda na WebView normalmente; sem precisar de plugin extra.

### Design

- Página `/musicas` segue padrão visual do `/loja`:
  - Header rosa compacto com título
  - Carrosséis horizontais por categoria
  - Cards `bg-[#FFD1E7] rounded-3xl`, título `text-base` sem ícones
- Categorias com ícones sutis no header de cada seção (lucide-react: Brain, Heart, Dumbbell, Utensils, Moon).

## Limitações conhecidas

- **Termos do YouTube**: precisa exibir o player oficial do YouTube (não pode mascarar como player próprio). O IFrame já cuida disso.
- **Anúncios**: vídeos podem ter ads (depende do criador). Usuário com YouTube Premium não vê. Sem solução nossa.
- **Background play no iOS**: WebView não toca em background quando o app é minimizado. Para tocar com tela bloqueada precisaria de um plugin nativo — fica como evolução futura, não no MVP.

## Fora do escopo deste MVP

- Busca dinâmica no YouTube (precisaria YouTube Data API key + cota).
- Favoritar playlist por usuário.
- Histórico de reprodução.
- Background play no iOS nativo.
- Integração com Spotify (pode ser adicionado depois como botão "Abrir no Spotify").

## Validação

1. Cadastrar 2-3 playlists em `/admin/musicas` por categoria.
2. Acessar `/musicas`, ver carrosséis.
3. Tocar uma playlist no modal — confirmar autoplay, controles e fechar.
4. Testar em viewport mobile (390x650) e em iOS nativo.
