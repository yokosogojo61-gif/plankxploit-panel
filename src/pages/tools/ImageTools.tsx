import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Image as ImageIcon,
  Download,
  Loader2,
  FileImage,
  Minimize2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

const ImageTools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Settings
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'File harus berupa gambar!', variant: 'destructive' });
      return;
    }

    setSelectedFile(file);
    setProcessedUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);

      // Get original dimensions
      const img = new window.Image();
      img.onload = () => {
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!selectedFile || !previewUrl) return;

    setLoading(true);

    try {
      const img = new window.Image();
      img.src = previewUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width || img.width;
      canvas.height = height || img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp';
      const dataUrl = canvas.toDataURL(mimeType, quality / 100);

      setProcessedUrl(dataUrl);
      toast({ title: 'Berhasil!', description: 'Gambar berhasil diproses' });
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memproses gambar', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;

    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `processed-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: 'Berhasil!', description: 'Gambar berhasil didownload' });
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedUrl(null);
    setWidth(0);
    setHeight(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="Image Tools" className="text-xl" glitch={false} />
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
            IMAGE TOOLS
          </h2>
          <p className="text-muted-foreground">
            Compress, resize, dan convert gambar
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload & Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6 space-y-4"
          >
            {/* File Upload */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Upload Gambar
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full mt-2"
              >
                <FileImage className="h-4 w-4 mr-2" />
                Pilih Gambar
              </Button>
              {selectedFile && (
                <p className="text-xs text-muted-foreground mt-2 truncate">
                  {selectedFile.name}
                </p>
              )}
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Width (px)
                </label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="bg-input/50 mt-2"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider">
                  Height (px)
                </label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="bg-input/50 mt-2"
                />
              </div>
            </div>

            {/* Quality */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full mt-2"
              />
            </div>

            {/* Format */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider">
                Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full bg-input/50 border border-border rounded-lg px-3 py-2 mt-2"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={processImage}
                disabled={!selectedFile || loading}
                className="flex-1 pulse-glow"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Minimize2 className="h-4 w-4 mr-2" />
                    Process
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-6 flex flex-col items-center justify-center min-h-[300px]"
          >
            {processedUrl ? (
              <>
                <img
                  src={processedUrl}
                  alt="Processed"
                  className="max-w-full max-h-[250px] rounded-lg mb-4 object-contain"
                />
                <Button onClick={handleDownload} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </>
            ) : previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-[250px] rounded-lg mb-4 object-contain opacity-50"
                />
                <p className="text-sm text-muted-foreground">Original Preview</p>
              </>
            ) : (
              <div className="text-center text-muted-foreground">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Preview akan muncul di sini</p>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ImageTools;
