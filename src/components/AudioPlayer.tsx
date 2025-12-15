import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface AudioPlayerRef {
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
}

interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(
  ({ src, autoPlay = true, loop = true }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          audioRef.current.play().catch(console.log);
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      },
      setVolume: (volume: number) => {
        if (audioRef.current) {
          audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
      },
    }));

    useEffect(() => {
      const audio = audioRef.current;
      if (audio && autoPlay) {
        // Try to autoplay
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay was prevented, wait for user interaction
            const handleInteraction = () => {
              audio.play().catch(console.log);
              document.removeEventListener('click', handleInteraction);
              document.removeEventListener('touchstart', handleInteraction);
            };
            document.addEventListener('click', handleInteraction);
            document.addEventListener('touchstart', handleInteraction);
          });
        }
      }
    }, [autoPlay]);

    return (
      <audio
        ref={audioRef}
        src={src}
        loop={loop}
        preload="auto"
        className="hidden"
      />
    );
  }
);

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
