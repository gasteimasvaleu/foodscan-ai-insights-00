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

  // Reforço silencioso: tenta dar play quando o vídeo estiver carregado.
  // IMPORTANTE: não chamar video.load() — isso invalida o "autoplay gesture"
  // implícito do <video autoPlay muted playsInline> no WKWebView do iOS e
  // faz o controle de play nativo aparecer sobre o primeiro frame.
  const handleLoadedData = () => {
    const video = videoRef.current;
    if (!video) return;
    const p = video.play();
    if (p !== undefined) {
      p.catch(() => {
        // Silencioso: o autoplay nativo já tenta tocar; se falhar aqui,
        // o fallback de 8s assume.
      });
    }
  };

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
            onLoadedData={handleLoadedData}
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
