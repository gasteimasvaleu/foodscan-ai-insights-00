Envolver disco + equalizer em um card preto translúcido, com as ondas ocupando toda a largura interna do card.

## Mudanças em `src/components/musicas/VinylPlayer.tsx`

1. **Card wrapper preto translúcido** envolvendo o disco e o equalizer:
   - `bg-black/70 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl p-6 w-full flex flex-col items-center gap-5`
   - Adiciona um brilho radial sutil rosa atrás do disco (`radial-gradient` com `#FD46A1` em baixa opacidade) para reforçar o efeito.

2. **Equalizer ocupando toda a largura**:
   - Substituir `gap-1 h-8` + 10 barras de `w-1` por: `w-full h-16 flex items-end justify-between gap-[2px]` com ~32-40 barras `flex-1`.
   - Aumentar amplitude do keyframe `eq-bar` (ex.: `0%, 100% { height: 8%; } 50% { height: 100%; }`) usando porcentagem para escalar com o container.
   - Cor das barras: `bg-gradient-to-t from-primary via-primary to-primary/40` para dar profundidade.
   - Delays variados (`${i * 0.05}s`) para um efeito mais orgânico.

3. **Track info** (categoria + título) fica **fora** do card preto, abaixo dele, mantendo legibilidade no fundo branco do modal.

4. **Iframe do YouTube** permanece fora do card, abaixo do track info.

Nenhuma mudança em `Musicas.tsx`, no `Dialog` ou em lógica de play/pause.