import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <VideoBackground />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center"
      >
        <MatrixText text="404" className="text-8xl mb-4" />
        <p className="text-xl text-muted-foreground mb-8">
          Page not found
        </p>
        <Button onClick={() => navigate('/')} className="pulse-glow">
          <Home className="h-4 w-4 mr-2" />
          Kembali
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
