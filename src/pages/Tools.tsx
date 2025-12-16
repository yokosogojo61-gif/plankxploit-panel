import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  QrCode,
  Code,
  Image,
  Lock,
  Crown,
  Diamond,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';

interface Profile {
  id: string;
  username: string;
  role: 'member' | 'premium' | 'vip';
  is_admin: boolean;
}

const TOOL_CATEGORIES = [
  {
    id: 'downloader',
    name: 'TOOLS DOWNLOADER',
    description: 'Download video tanpa watermark',
    icon: Download,
    level: 'member',
    route: '/tools/downloader',
  },
  {
    id: 'qr',
    name: 'QR GENERATOR',
    description: 'Generate QR Code custom',
    icon: QrCode,
    level: 'member',
    route: '/tools/qr',
  },
  {
    id: 'source',
    name: 'SOURCE CODE VIEWER',
    description: 'Lihat source code website',
    icon: Code,
    level: 'premium',
    route: '/tools/source',
  },
  {
    id: 'image',
    name: 'IMAGE TOOLS',
    description: 'Compress, resize, convert gambar',
    icon: Image,
    level: 'premium',
    route: '/tools/image',
  },
];

const Tools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (data) setProfile(data);
  };

  const levelHierarchy = { member: 1, premium: 2, vip: 3 };

  const canAccessTool = (toolLevel: string) => {
    if (!profile) return false;
    return levelHierarchy[profile.role] >= levelHierarchy[toolLevel as keyof typeof levelHierarchy];
  };

  const handleToolClick = (tool: typeof TOOL_CATEGORIES[0]) => {
    if (!canAccessTool(tool.level)) {
      toast({
        title: 'Akses Ditolak!',
        description: `Tool ini memerlukan akun ${tool.level.toUpperCase()}`,
        variant: 'destructive',
      });
      return;
    }
    navigate(tool.route);
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'vip':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/50">
            VIP
          </span>
        );
      case 'premium':
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/50">
            PREMIUM
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/50">
            MEMBER
          </span>
        );
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'vip':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'premium':
        return 'border-purple-500/50 bg-purple-500/10';
      default:
        return 'border-primary/50 bg-primary/10';
    }
  };

  return (
    <div className="relative min-h-screen">
      <VideoBackground />

      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="Tools" className="text-xl" glitch={false} />
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-display text-primary mb-2">PILIH TOOLS</h2>
          <p className="text-muted-foreground">
            Role kamu: {profile?.role.toUpperCase()}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {TOOL_CATEGORIES.map((tool, index) => {
            const isLocked = !canAccessTool(tool.level);
            
            return (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: isLocked ? 1 : 1.02 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => handleToolClick(tool)}
                className={`relative p-6 rounded-lg border ${getLevelColor(tool.level)} backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`p-4 rounded-full ${tool.level === 'vip' ? 'bg-yellow-500/20' : tool.level === 'premium' ? 'bg-purple-500/20' : 'bg-primary/20'}`}>
                    <tool.icon className={`h-8 w-8 ${tool.level === 'vip' ? 'text-yellow-400' : tool.level === 'premium' ? 'text-purple-400' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display text-foreground">{tool.name}</span>
                      {getLevelBadge(tool.level)}
                    </div>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        {profile?.role === 'member' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-muted-foreground mb-4">
              Upgrade akun untuk mengakses semua tools
            </p>
            <Button onClick={() => navigate('/payment')} className="pulse-glow">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Sekarang
            </Button>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Tools;
