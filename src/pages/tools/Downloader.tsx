import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Loader2,
  Youtube,
  Instagram,
  Music2,
  Facebook,
  Twitter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

const PLATFORMS = [
  { id: 'tiktok', name: 'TikTok', icon: Music2, color: 'text-pink-400' },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-400' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-purple-400' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-400' },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-sky-400' },
];

const Downloader = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const detectPlatform = (inputUrl: string) => {
    if (inputUrl.includes('tiktok.com')) return 'tiktok';
    if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) return 'youtube';
    if (inputUrl.includes('instagram.com')) return 'instagram';
    if (inputUrl.includes('facebook.com') || inputUrl.includes('fb.watch')) return 'facebook';
    if (inputUrl.includes('twitter.com') || inputUrl.includes('x.com')) return 'twitter';
    return null;
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    const detected = detectPlatform(value);
    if (detected) setSelectedPlatform(detected);
  };

  const handleDownload = async () => {
    if (!url.trim()) {
      toast({ title: 'Error', description: 'Masukkan URL video!', variant: 'destructive' });
      return;
    }

    const platform = detectPlatform(url);
    if (!platform) {
      toast({ title: 'Error', description: 'Platform tidak dikenali!', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('video-downloader', {
        body: { url, platform },
      });

      if (error) throw error;

      if (data?.download_url) {
        setResult(data);
        toast({ title: 'Berhasil!', description: 'Video siap didownload' });
      } else {
        throw new Error('Tidak dapat mengambil video');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengambil video',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="Video Downloader" className="text-xl" glitch={false} />
          <Button variant="ghost" onClick={() => navigate('/tools')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-display text-primary mb-2">
            DOWNLOAD VIDEO TANPA WATERMARK
          </h2>
          <p className="text-muted-foreground">
            Paste URL video dari platform yang didukung
          </p>
        </motion.div>

        {/* Platform Icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-4 mb-8"
        >
          {PLATFORMS.map((platform) => (
            <div
              key={platform.id}
              className={`p-3 rounded-full bg-card/80 border border-border ${selectedPlatform === platform.id ? 'border-primary' : ''}`}
            >
              <platform.icon className={`h-6 w-6 ${platform.color}`} />
            </div>
          ))}
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6 space-y-4"
        >
          <Input
            placeholder="Paste URL video di sini..."
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            className="bg-input/50 text-center"
          />

          <Button
            onClick={handleDownload}
            disabled={loading || !url.trim()}
            className="w-full pulse-glow"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </motion.div>

        {/* Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6"
          >
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt="Thumbnail"
                className="w-full rounded-lg mb-4"
              />
            )}
            {result.title && (
              <p className="text-sm text-muted-foreground mb-4">{result.title}</p>
            )}
            <a
              href={result.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
            </a>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>Platform yang didukung:</p>
          <p>TikTok • YouTube • Instagram • Facebook • Twitter/X</p>
        </motion.div>
      </main>
    </div>
  );
};

export default Downloader;
