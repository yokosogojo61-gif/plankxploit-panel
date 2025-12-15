import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
}

const PLANK_DEV_CHARS = ['P', 'L', 'A', 'N', 'K', ' ', 'D', 'E', 'V'];

const TouchAnimation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const createParticles = useCallback((x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 5; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        char: PLANK_DEV_CHARS[Math.floor(Math.random() * PLANK_DEV_CHARS.length)],
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);

    // Remove particles after animation
    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.find((np) => np.id === p.id))
      );
    }, 1000);
  }, []);

  useEffect(() => {
    const handleTouch = (e: TouchEvent) => {
      const touch = e.touches[0];
      createParticles(touch.clientX, touch.clientY);
    };

    const handleClick = (e: MouseEvent) => {
      createParticles(e.clientX, e.clientY);
    };

    document.addEventListener('touchstart', handleTouch);
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('touchstart', handleTouch);
      document.removeEventListener('click', handleClick);
    };
  }, [createParticles]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{
              opacity: 1,
              scale: 1,
              x: particle.x,
              y: particle.y,
            }}
            animate={{
              opacity: 0,
              scale: 2,
              y: particle.y - 100,
              x: particle.x + (Math.random() - 0.5) * 100,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="absolute font-display text-lg text-primary text-glow-sm"
            style={{ left: 0, top: 0 }}
          >
            {particle.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TouchAnimation;
