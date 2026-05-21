## Player de Músicas com visual estilo "vinil"

Inspirar no componente compartilhado pra dar um upgrade visual ao modal de `/musicas`, mantendo YouTube como fonte (sem visualizer reativo a áudio, já que YouTube iframe não expõe áudio).

### O que muda

**1. Novo componente `src/components/musicas/VinylPlayer.tsx`**

Layout do modal:
```
┌──────────────────────────────┐
│         [capa girando]       │  ← disco com capa, animação CSS
│      (clique = pausa/play)   │
├──────────────────────────────┤
│   Artista (categoria)        │
│   Título da playlist         │
│                              │
│   [▶ Abrir player YouTube]   │
└──────────────────────────────┘
```

Elementos visuais portados do componente:
- **Disco girando** (`.spin`): capa da playlist em círculo com `animation: spin 18s linear infinite`, pausa quando `isPlaying=false`
- **Furo central** branco com sombra interna (estética de vinil)
- **Máscara circular** com `border-radius: 50%` e leve `scale(1.01)`
- **Animação de entrada** suave (`cover-enter`)
- Botão central play/pause sobreposto ao disco
- Barra de "ondas" decorativa CSS (10 colunas animadas em loop) — visual estático/temporizado, não reativo a áudio
- Tipografia: artist em uppercase tracking-wider, título em serif grande
- Cores: glassmorphism `bg-white/70 backdrop-blur-md`, primary `#FD46A1`

**2. `src/pages/Musicas.tsx`**
- Quando user clica numa playlist → abre o `VinylPlayer` (modal)
- O `VinylPlayer` mostra a capa girando + título + botão "▶ Tocar no YouTube"
- Ao clicar em "Tocar", expande o `YouTubePlayer` (iframe atual) abaixo do disco e dispara `isPlaying=true` (disco começa a girar)
- Sem detecção real de play do iframe — uso toggle manual controlado pelo botão. Simples e previsível.

**3. CSS**
- Adicionar keyframes `@keyframes spin-vinyl` em `src/index.css` (ou inline no componente via styled string)
- Animações respeitam `prefers-reduced-motion`

### O que NÃO vai funcionar (limitação técnica honesta)

- **Visualizer de áudio reativo** (`ScalesMixer` com FFT) — impossível com YouTube iframe. Substituído por animação cíclica decorativa
- **Controles next/prev/shuffle/loop de faixas** — uma playlist do YouTube já tem isso embutido no próprio iframe quando o user expande
- **Barra de progresso real** — sem acesso ao tempo do vídeo. Removida

### Arquivos

- `src/components/musicas/VinylPlayer.tsx` (novo, ~150 linhas)
- `src/pages/Musicas.tsx` (substitui o conteúdo do DialogContent)
- `src/index.css` (adiciona keyframes se necessário)

Nada de mudanças no banco, no admin, ou no `YouTubePlayer` existente.
