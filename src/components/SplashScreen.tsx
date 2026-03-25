import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleEnd = () => {
    setIsVisible(false);
    setTimeout(onComplete, 500);
  };

  useEffect(() => {
    const timer = setTimeout(handleEnd, 8000);
    return () => clearTimeout(timer);
  }, [onComplete]);

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
            autoPlay
            muted
            playsInline
            onEnded={handleEnd}
            className="w-full h-full object-cover"
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/App_icon_morphs_202603250602.mp4"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
