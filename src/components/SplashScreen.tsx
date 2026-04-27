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

  useEffect(() => {
    const timer = setTimeout(handleEnd, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

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

    const tryPlay = async () => {
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        console.warn('[SplashScreen] Autoplay bloqueado, pulando splash:', err);
        // Se o autoplay foi bloqueado, evita travar com botão de play visível
        handleEnd();
      }
    };

    tryPlay();
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
            // @ts-expect-error - atributo legado do WKWebView
            "webkit-playsinline"=""
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/splashrosa.mp4"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
