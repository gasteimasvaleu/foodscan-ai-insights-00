import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[60] flex items-center justify-center"
        >
          {/* Video background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/openart-video_172ff066_1774432172784.mp4"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white drop-shadow-lg"
            >
              {message}
            </motion.p>

            {subMessage && (
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 text-sm drop-shadow"
              >
                {subMessage}
              </motion.p>
            )}

            {/* Animated progress bar */}
            <div className="w-64 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeInOut',
                }}
                style={{ width: '50%' }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VideoOverlay;
