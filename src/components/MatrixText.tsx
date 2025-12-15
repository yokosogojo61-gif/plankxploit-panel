import { motion } from 'framer-motion';

interface MatrixTextProps {
  text: string;
  className?: string;
  glitch?: boolean;
}

const MatrixText = ({ text, className = '', glitch = true }: MatrixTextProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative font-display ${className}`}
    >
      {/* Main text */}
      <span
        className={`text-glow text-primary ${glitch ? 'glitch' : ''}`}
        data-text={text}
      >
        {text}
      </span>

      {/* Glitch layers */}
      {glitch && (
        <>
          <span
            className="absolute left-0 top-0 -translate-x-0.5 text-cyber-red opacity-70"
            style={{ clipPath: 'inset(10% 0 60% 0)' }}
            aria-hidden="true"
          >
            {text}
          </span>
          <span
            className="absolute left-0 top-0 translate-x-0.5 text-cyber-blue opacity-70"
            style={{ clipPath: 'inset(60% 0 10% 0)' }}
            aria-hidden="true"
          >
            {text}
          </span>
        </>
      )}
    </motion.div>
  );
};

export default MatrixText;
