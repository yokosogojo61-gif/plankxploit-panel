import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, QrCode, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

const QRGenerator = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState(256);
  const [bgColor, setBgColor] = useState('ffffff');
  const [fgColor, setFgColor] = useState('000000');

  const generateQR = () => {
    if (!text.trim()) {
      toast({ title: 'Error', description: 'Masukkan teks atau URL!', variant: 'destructive' });
      return;
    }

    // Using QR Server API
    const encodedText = encodeURIComponent(text);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedText}&bgcolor=${bgColor}&color=${fgColor}`;
    setQrUrl(url);
    toast({ title: 'Berhasil!', description: 'QR Code berhasil dibuat' });
  };

  const handleDownload = async () => {
    if (!qrUrl) return;

    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: 'Berhasil!', description: 'QR Code berhasil didownload' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal download QR Code', variant: 'destructive' });
    }
  };

  const handleCopy = async () => {
    if (!qrUrl) return;

    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      toast({ title: 'Berhasil!', description: 'URL QR Code disalin' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menyalin URL', variant: 'destructive' });
    }
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="QR Generator" className="text-xl" glitch={false} />
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
            QR CODE GENERATOR
          </h2>
          <p className="text-muted-foreground">
            Generate QR Code dari teks atau URL
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6 space-y-4"
          >
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Teks / URL
              </label>
              <Input
                placeholder="Masukkan teks atau URL..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="bg-input/50 mt-2"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Ukuran (px)
              </label>
              <Input
                type="number"
                min={128}
                max={512}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="bg-input/50 mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Warna Background
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={`#${bgColor}`}
                    onChange={(e) => setBgColor(e.target.value.replace('#', ''))}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="bg-input/50 flex-1"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Warna QR
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={`#${fgColor}`}
                    onChange={(e) => setFgColor(e.target.value.replace('#', ''))}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="bg-input/50 flex-1"
                    maxLength={6}
                  />
                </div>
              </div>
            </div>

            <Button onClick={generateQR} className="w-full pulse-glow">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR Code
            </Button>
          </motion.div>

          {/* Preview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6 flex flex-col items-center justify-center"
          >
            {qrUrl ? (
              <>
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="rounded-lg mb-4"
                  style={{ maxWidth: size, maxHeight: size }}
                />
                <div className="flex gap-2 w-full">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>QR Code akan muncul di sini</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default QRGenerator;
