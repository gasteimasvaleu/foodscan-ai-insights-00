import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

interface SplashScreenProps {
  onComplete: () => void;
}

// Detecção síncrona e blindada de iOS nativo. Executada no momento do import
// para garantir que o primeiro render já tenha o valor correto, sem depender
// do bootstrap assíncrono de hooks.
const isNativeIOSEnv = (() => {
  try {
    if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
      return true;
    }
  } catch {
    // Capacitor pode não estar pronto — cai no fallback abaixo.
  }
  // Fallback por UA: se o app foi instalado como standalone num iPhone/iPad,
  // tratamos como nativo pra nunca renderizar o <video>.
  try {
    const ua = navigator.userAgent || '';
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
    const isStandalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    return isIOSDevice && isStandalone;
  } catch {
    return false;
  }
})();

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  // Diagnóstico: aparece no Safari Web Inspector quando o iPhone está conectado.
  // Use isso pra confirmar se o Capacitor foi detectado corretamente no device.
  console.log(
    '[SplashScreen] platform:',
    (() => { try { return Capacitor.getPlatform(); } catch { return 'unknown'; } })(),
    'isNative:',
    (() => { try { return Capacitor.isNativePlatform(); } catch { return false; } })(),
    'isNativeIOSEnv:',
    isNativeIOSEnv,
  );

  const [isVisible, setIsVisible] = useState(true);

  const handleEnd = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  // Fallback de segurança: nunca trava o app.
  useEffect(() => {
    const timer = setTimeout(handleEnd, 8000);
    return () => clearTimeout(timer);
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // iOS NATIVO: branch totalmente isolado. NUNCA monta a tag <video> no DOM,
  // garantindo que o WKWebView não consiga desenhar o controle de play nativo
  // sobre o splash (independente de Low Power Mode, gestos ou config).
  // ──────────────────────────────────────────────────────────────────────────
  if (isNativeIOSEnv) {
    return (
      <NativeIOSSplash isVisible={isVisible} onShortTimeout={handleEnd} />
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // WEB / PWA / ANDROID: mantém a animação de vídeo com fallback pra imagem.
  // ──────────────────────────────────────────────────────────────────────────
  return <WebSplash isVisible={isVisible} onEnd={handleEnd} />;
};

// ─── Native iOS variant (image only, no <video> ever in DOM) ──────────────────

const NativeIOSSplash: React.FC<{ isVisible: boolean; onShortTimeout: () => void }> = ({
  isVisible,
  onShortTimeout,
}) => {
  useEffect(() => {
    const timer = setTimeout(onShortTimeout, 2500);
    return () => clearTimeout(timer);
  }, [onShortTimeout]);

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
          <img
            src="/splash-frame.png"
            alt=""
            className="w-full h-full object-cover pointer-events-none select-none"
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Web / PWA / Android variant (video with image fallback) ──────────────────

const WebSplash: React.FC<{ isVisible: boolean; onEnd: () => void }> = ({ isVisible, onEnd }) => {
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoFailed) return;
    const timer = setTimeout(onEnd, 2500);
    return () => clearTimeout(timer);
  }, [videoFailed, onEnd]);

  // IMPORTANTE: não chamar video.load() — invalida o "autoplay gesture"
  // implícito do <video autoPlay muted playsInline>.
  const handleLoadedData = () => {
    const video = videoRef.current;
    if (!video) return;
    const p = video.play();
    if (p !== undefined) {
      p.catch(() => setVideoFailed(true));
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
          {videoFailed ? (
            <img
              src="/splash-frame.png"
              alt=""
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <video
              ref={videoRef}
              autoPlay
              muted
              defaultMuted
              playsInline
              preload="auto"
              disablePictureInPicture
              controls={false}
              onEnded={onEnd}
              onLoadedData={handleLoadedData}
              onError={() => setVideoFailed(true)}
              className="w-full h-full object-cover pointer-events-none"
              {...({ 'webkit-playsinline': '' } as any)}
              src="/splashrosa.mp4"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
