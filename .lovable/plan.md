# Suporte a Vimeo na Central de Treinos

## Problema

O `VideoModal` (`src/components/VideoModal.tsx`) só converte links do **YouTube** em iframe embed. Qualquer outra URL é jogada na tag `<video>`, que espera um arquivo `.mp4`/`.webm` direto.

O link cadastrado (`https://vimeo.com/1190396539`) é uma **página HTML do Vimeo**, não um arquivo de vídeo. Resultado: a tag `<video>` falha, dispara `onError`, e o modal mostra o estado "Não foi possível reproduzir o vídeo / Abrir externamente".

## Solução

Adicionar detecção e conversão de URLs do Vimeo para o player oficial em iframe — mesmo padrão já usado para YouTube.

### Mudanças em `src/components/VideoModal.tsx`

1. **Detectar URLs do Vimeo** em `getEmbedUrl()`:
   - `vimeo.com/{ID}` → `https://player.vimeo.com/video/{ID}`
   - `vimeo.com/{ID}/{HASH}` (vídeos privados com hash) → `https://player.vimeo.com/video/{ID}?h={HASH}`
   - `player.vimeo.com/video/{ID}` → mantém como está

2. **Tratar Vimeo como iframe**, igual ao YouTube:
   - Trocar a flag `isYouTube` por `isIframeEmbed` (cobre YouTube + Vimeo)
   - O bloco `<iframe>` continua igual, apenas com `allow` ajustado para incluir `fullscreen`

3. **Manter o fallback** atual (`videoError` + botão "Abrir externamente") para qualquer outra fonte que falhar.

### Resultado esperado

- O vídeo "TREINO DE GLÚTEO QUE TRANSFORMA" (link Vimeo já cadastrado) passa a tocar dentro do modal sem precisar trocar nada no admin.
- Novos cadastros via admin podem usar links do YouTube **ou** Vimeo indistintamente.
- Arquivos `.mp4` diretos (Supabase Storage) continuam funcionando via tag `<video>`.

## Observações técnicas

- Não muda banco de dados, edge functions, nem o admin de treinos.
- Não muda estilo nem layout do modal.
- Vídeos privados do Vimeo só tocam embedados se o dono permitir embed em domínios externos (configuração do Vimeo). Se estiver bloqueado, o iframe mostra "Privacy settings" do próprio Vimeo — nesse caso o usuário precisa ajustar as permissões na conta Vimeo.
