

## Substituir Splash Screen por vídeo de 8 segundos

### O que muda

Trocar toda a animação atual (logo estático + texto + dots) por um vídeo MP4 fullscreen que dura 8 segundos.

### Alteracao

**`src/components/SplashScreen.tsx`**:
- Remover o logo estático, texto "We Diet", texto "Dieta Inteligente" e os dots de loading
- Substituir por um elemento `<video>` fullscreen com a URL: `https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/App_icon_morphs_202603250602.mp4`
- Video configurado com `autoPlay`, `muted`, `playsInline`, sem controles
- Fundo preto para evitar flash branco enquanto o vídeo carrega
- Ajustar o timer de 4000ms para 8000ms (duração do vídeo)
- Manter a animação de fade-out ao finalizar via Framer Motion
- Usar `object-cover` para preencher a tela inteira no formato 9:16
- Adicionar evento `onEnded` no vídeo como fallback para garantir que o splash encerre mesmo se o timer falhar

