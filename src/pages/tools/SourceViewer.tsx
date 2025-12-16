import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Code, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

const SourceViewer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [sourceCode, setSourceCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchSource = async () => {
    if (!url.trim()) {
      toast({ title: 'Error', description: 'Masukkan URL website!', variant: 'destructive' });
      return;
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      toast({ title: 'Error', description: 'URL tidak valid!', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setSourceCode(null);

    try {
      const { data, error } = await supabase.functions.invoke('fetch-source', {
        body: { url },
      });

      if (error) throw error;

      if (data?.source) {
        setSourceCode(data.source);
        toast({ title: 'Berhasil!', description: 'Source code berhasil diambil' });
      } else {
        throw new Error('Tidak dapat mengambil source code');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengambil source code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!sourceCode) return;

    try {
      await navigator.clipboard.writeText(sourceCode);
      setCopied(true);
      toast({ title: 'Berhasil!', description: 'Source code disalin' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyalin', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    if (!sourceCode) return;

    const blob = new Blob([sourceCode], { type: 'text/html' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `source-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
    toast({ title: 'Berhasil!', description: 'Source code berhasil didownload' });
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="Source Viewer" className="text-xl" glitch={false} />
          <Button variant="ghost" onClick={() => navigate('/tools')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-display text-primary mb-2">
            WEBSITE SOURCE CODE VIEWER
          </h2>
          <p className="text-muted-foreground">
            Lihat source code HTML dari website manapun
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6 space-y-4 mb-6"
        >
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-input/50 flex-1"
            />
            <Button onClick={fetchSource} disabled={loading} className="pulse-glow">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Code className="h-4 w-4 mr-2" />
                  Fetch
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Source Code Display */}
        {sourceCode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <span className="text-sm text-muted-foreground">
                {sourceCode.length.toLocaleString()} characters
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  Download
                </Button>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
            <pre className="p-4 overflow-auto max-h-[500px] text-xs font-mono text-muted-foreground">
              <code>{sourceCode}</code>
            </pre>
          </motion.div>
        )}

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          <p>Masukkan URL lengkap dengan https:// atau http://</p>
          <p className="text-xs mt-2 text-yellow-400">
            * Beberapa website mungkin memblokir akses
          </p>
        </motion.div>
      </main>
    </div>
  );
};

export default SourceViewer;
