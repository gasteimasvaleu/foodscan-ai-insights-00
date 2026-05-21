Ajustar o card de playlist para usar a thumb em formato 16:9 e mover título + descrição para uma faixa preta translúcida sobreposta na base da imagem.

## Mudanças em `src/components/musicas/PlaylistCard.tsx`

1. **Container da imagem**: trocar `aspect-square` por `aspect-video` (16:9), mantendo `object-cover`.
2. **Card**: remover o padding inferior com texto separado; a thumb passa a ocupar o card inteiro. Manter `rounded-3xl overflow-hidden` e `bg-[#FFD1E7]` como fallback.
3. **Faixa preta translúcida sobre a imagem** (absolute bottom):
   - `absolute inset-x-0 bottom-0 bg-black/55 backdrop-blur-sm px-3 py-2`
   - Título: `text-sm text-white line-clamp-1 leading-tight`
   - Descrição (se existir): `text-[11px] text-white/75 line-clamp-1 mt-0.5`
4. **Gradient sutil opcional** do transparente ao preto acima da faixa, para legibilidade quando a faixa ficar fina (`bg-gradient-to-t from-black/60 to-transparent` em uma camada extra).
5. Remover a `div` externa de texto (linhas 52-56).

## Impacto no carrossel em `Musicas.tsx`

O `basis-[55%] sm:basis-[38%]` continua válido. Como agora os cards são 16:9 (mais largos que altos), os cards ficarão mais baixos — sem ajuste necessário no carousel.

Nenhuma mudança em `Musicas.tsx`, `VinylPlayer` ou banco de dados.