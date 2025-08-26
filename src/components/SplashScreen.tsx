import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import foodscanLogo from '@/assets/foodscan-logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Delay para a animação de saída
    }, 4000);

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-animated"
        >
          <div className="text-center">
            {/* Logo com efeito breathing */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-6"
            >
              <img 
                src={foodscanLogo} 
                alt="FoodScan AI" 
                className="w-24 h-24 mx-auto drop-shadow-lg"
              />
            </motion.div>

            {/* Texto que aparece com fade-in */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                FoodScan AI
              </h1>
              <p className="text-white/80 text-lg">
                Dieta Inteligente
              </p>
            </motion.div>

            {/* Indicador de loading sutil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
              className="mt-8"
            >
              <div className="flex justify-center">
                <div className="animate-pulse-glow w-2 h-2 bg-white/60 rounded-full mx-1"></div>
                <div className="animate-pulse-glow w-2 h-2 bg-white/60 rounded-full mx-1" style={{ animationDelay: '0.3s' }}></div>
                <div className="animate-pulse-glow w-2 h-2 bg-white/60 rounded-full mx-1" style={{ animationDelay: '0.6s' }}></div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;