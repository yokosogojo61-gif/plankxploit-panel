import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, X, Maximize } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  onPlayStateChange?: (playing: boolean) => void;
}

const VideoPlayer = ({ src, onPlayStateChange }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
        onPlayStateChange?.(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        onPlayStateChange?.(true);
      }
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    onPlayStateChange?.(false);
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-lg overflow-hidden border border-border/50 bg-card/50"
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video object-cover"
        onEnded={handleVideoEnd}
        playsInline
      />

      {/* Overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity ${
          isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
        } bg-background/30`}
      >
        <button
          onClick={togglePlay}
          className="p-4 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/50 text-primary hover:bg-primary/30 transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8" />
          )}
        </button>
      </div>

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-2 right-2 p-2 rounded bg-background/50 backdrop-blur-sm text-foreground hover:bg-background/70 transition-colors"
      >
        <Maximize className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default VideoPlayer;
