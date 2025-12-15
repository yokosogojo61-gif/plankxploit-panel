import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationBarProps {
  onClose: () => void;
}

const NotificationBar = ({ onClose }: NotificationBarProps) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleJoin = () => {
    window.open('https://whatsapp.com/channel/0029Vb2QKduA89MpcV9yGr1z', '_blank');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="relative w-full max-w-md cyber-border rounded-lg bg-card p-6"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute right-2 top-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="mb-4 flex justify-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center"
              >
                <span className="text-3xl">🚀</span>
              </motion.div>
            </div>

            {/* Text */}
            <div className="mb-6 text-center">
              <h3 className="text-lg font-display text-primary text-glow-sm mb-2">
                PEMBERITAHUAN!
              </h3>
              <p className="text-sm text-foreground leading-relaxed error-flicker">
                SEBELUM LANJUT YUU JOIN SALURAN PLANKDEV, UNTUK MENDAPATKAN VERSI TERBARU NYA!!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-primary/50 text-primary hover:bg-primary/10"
              >
                CLOSE
              </Button>
              <Button
                onClick={handleJoin}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 pulse-glow"
              >
                JOIN
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationBar;
