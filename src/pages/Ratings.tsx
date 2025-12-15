import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

interface Rating {
  id: string;
  name: string;
  message: string;
  stars: number;
}

const Ratings = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    const { data } = await supabase.from('ratings').select('*');
    if (data) setRatings(data);
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />
      <div className="container mx-auto px-4 py-8 relative z-10">
        <MatrixText text="RATINGS" className="text-3xl text-center mb-8" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ratings.map((rating, i) => (
            <motion.div
              key={rating.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-4"
            >
              <div className="flex gap-1 mb-2">
                {Array.from({ length: rating.stars }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-2">{rating.message}</p>
              <p className="text-xs text-primary">- {rating.name}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ratings;
