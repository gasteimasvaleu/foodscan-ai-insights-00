import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnd = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  // Fallback de segurança: não trava o app se o vídeo falhar
  useEffect(() => {
    const timer = setTimeout(handleEnd, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Garante que o iOS WebView entenda como mute (necessário p/ autoplay)
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.removeAttribute('controls');

    let cancelled = false;

    const tryPlay = async () => {
      if (cancelled) return;
      try {
        const p = video.play();
        if (p !== undefined) await p;
      } catch (err) {
        // Não pula a splash em caso de falha — apenas registra e tenta de novo
        // nos próximos eventos do <video>.
        console.warn('[SplashScreen] play() falhou, aguardando próximo evento:', err);
      }
    };

    // Tentativa inicial
    tryPlay();

    // Reforços baseados em eventos de carregamento do vídeo
    const onLoaded = () => tryPlay();
    const onCanPlay = () => tryPlay();
    const onCanPlayThrough = () => tryPlay();

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('canplaythrough', onCanPlayThrough);

    // Garante que o vídeo seja (re)carregado
    try {
      video.load();
    } catch {}

    return () => {
      cancelled = true;
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            defaultMuted
            playsInline
            preload="auto"
            disablePictureInPicture
            controls={false}
            onEnded={handleEnd}
            className="w-full h-full object-cover pointer-events-none"
            {...({ 'webkit-playsinline': '' } as any)}
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/splashrosa.mp4"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
