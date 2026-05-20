import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSpinner } from '@/components/ui/animated-spinner';

interface VideoOverlayProps {
  isVisible: boolean;
  message: string;
  subMessage?: string;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ isVisible, message, subMessage }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-white/95 backdrop-blur-xl"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at center, transparent 35%, rgba(253,70,161,0.18) 75%, rgba(253,70,161,0.35) 100%)',
          }}
        >
          <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
            <AnimatedSpinner size="9rem" />

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-[#FD46A1]"
            >
              {message}
            </motion.p>

            {subMessage && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-foreground/60 text-sm max-w-xs"
              >
                {subMessage}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoOverlay;
