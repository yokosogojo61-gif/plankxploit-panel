import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const loadingMessages = [
  '[ * ] Initializing PlankXploit System...',
  '[ * ] Loading kernel modules...',
  '[ OK ] Loaded module: network_stack',
  '[ OK ] Loaded module: crypto_engine',
  '[ OK ] Loaded module: exploit_framework',
  '[ * ] Establishing secure connection...',
  '[ OK ] Connection established',
  '[ * ] Mounting encrypted filesystem...',
  '[ OK ] Filesystem mounted at /plank',
  '[ * ] Loading tools database...',
  '[ OK ] 50+ tools loaded successfully',
  '[ * ] Initializing user interface...',
  '[ OK ] UI components loaded',
  '[ * ] Checking system integrity...',
  '[ OK ] All systems operational',
  '[ * ] Starting PlankXploit v5.0...',
  '',
  '╔═══════════════════════════════════════╗',
  '║     PLANKXPLOIT SYSTEM READY          ║',
  '║     Press any key to continue...      ║',
  '╚═══════════════════════════════════════╝',
];

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [lines, setLines] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < loadingMessages.length) {
      const timer = setTimeout(() => {
        setLines((prev) => [...prev, loadingMessages[currentIndex]]);
        setCurrentIndex((prev) => prev + 1);
        setProgress((currentIndex / loadingMessages.length) * 100);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      setProgress(100);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (isComplete) {
      const handleKeyPress = () => {
        onComplete();
      };

      const handleClick = () => {
        onComplete();
      };

      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('click', handleClick);
      window.addEventListener('touchstart', handleClick);

      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('click', handleClick);
        window.removeEventListener('touchstart', handleClick);
      };
    }
  }, [isComplete, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4"
      >
        <div className="w-full max-w-2xl">
          {/* Terminal header */}
          <div className="mb-2 flex items-center gap-2 rounded-t-lg border border-primary/30 bg-secondary/50 px-4 py-2">
            <div className="h-3 w-3 rounded-full bg-destructive" />
            <div className="h-3 w-3 rounded-full bg-yellow-500" />
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="ml-4 text-xs text-muted-foreground">
              plankxploit@system:~$
            </span>
          </div>

          {/* Terminal body */}
          <div className="h-80 overflow-hidden rounded-b-lg border border-t-0 border-primary/30 bg-background/80 p-4 font-mono text-xs backdrop-blur-sm md:text-sm">
            <div className="space-y-1">
              {lines.map((line, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`${
                    line.includes('[ OK ]')
                      ? 'text-primary'
                      : line.includes('[ * ]')
                      ? 'text-yellow-400'
                      : line.includes('═') || line.includes('║')
                      ? 'text-primary text-glow'
                      : 'text-foreground'
                  }`}
                >
                  {line}
                </motion.div>
              ))}
              {!isComplete && (
                <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>Installing PlankXploit...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {isComplete && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-primary animate-pulse"
            >
              Click anywhere or press any key to continue...
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
