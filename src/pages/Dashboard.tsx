import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Send,
  PhoneCall,
  Bomb,
  Bug,
  Zap,
  Shield,
  Terminal,
  Star,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Volume2,
  VolumeX,
  Crown,
  Diamond,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import VideoBackground from '@/components/VideoBackground';
import AudioPlayer, { AudioPlayerRef } from '@/components/AudioPlayer';
import MatrixText from '@/components/MatrixText';
import TypingText from '@/components/TypingText';
import ToolCard from '@/components/ToolCard';
import SocialLinks from '@/components/SocialLinks';
import VideoPlayer from '@/components/VideoPlayer';
import profileLogo from '@/assets/profile-logo.jpg';

interface Profile {
  id: string;
  username: string;
  role: 'member' | 'premium' | 'vip';
  is_admin: boolean;
  avatar_url: string | null;
}

// Tool definitions with access levels
const tools = [
  // Member tools (LOW)
  { id: 'spam-sms', name: 'Spam SMS', icon: Send, category: 'spam', level: 'member', description: 'Kirim SMS massal' },
  { id: 'spam-call', name: 'Spam Call', icon: PhoneCall, category: 'spam', level: 'member', description: 'Panggilan otomatis' },
  { id: 'bug-wa', name: 'Bug WA', icon: Bug, category: 'bug', level: 'member', description: 'Crash WhatsApp target' },
  
  // Premium tools (HIGH)
  { id: 'bomber-pro', name: 'Bomber Pro', icon: Bomb, category: 'bomber', level: 'premium', description: 'Bomber SMS Premium' },
  { id: 'ddos-lite', name: 'DDoS Lite', icon: Zap, category: 'attack', level: 'premium', description: 'Serangan DDoS ringan' },
  { id: 'crash-call', name: 'Crash Call', icon: PhoneCall, category: 'crash', level: 'premium', description: 'Crash via panggilan' },
  { id: 'mass-report', name: 'Mass Report', icon: Shield, category: 'report', level: 'premium', description: 'Laporan massal' },
  
  // VIP tools (ALL)
  { id: 'nuke-account', name: 'Nuke Account', icon: Bomb, category: 'nuke', level: 'vip', description: 'Hapus akun target' },
  { id: 'super-bomber', name: 'Super Bomber', icon: Zap, category: 'bomber', level: 'vip', description: 'Bomber unlimited' },
  { id: 'hack-tools', name: 'Hack Tools', icon: Terminal, category: 'hack', level: 'vip', description: 'Tools hacking lanjutan' },
  { id: 'bypass-otp', name: 'Bypass OTP', icon: Shield, category: 'bypass', level: 'vip', description: 'Lewati verifikasi OTP' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useRef<AudioPlayerRef>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (error || !profileData) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(profileData);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleToolClick = (tool: typeof tools[0]) => {
    const userLevel = profile?.role || 'member';
    const levelHierarchy = { member: 1, premium: 2, vip: 3 };

    if (levelHierarchy[tool.level as keyof typeof levelHierarchy] > levelHierarchy[userLevel]) {
      toast({
        title: 'Akses Ditolak!',
        description: `Tool ini memerlukan akun ${tool.level.toUpperCase()}`,
        variant: 'destructive',
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        title: 'Error!',
        description: 'Masukkan nomor target terlebih dahulu!',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Tool Dijalankan!',
      description: `${tool.name} sedang berjalan ke ${phoneNumber}`,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleVideoPlayStateChange = (playing: boolean) => {
    setIsVideoPlaying(playing);
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else if (!isMuted) {
        audioRef.current.play();
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'vip':
        return (
          <span className="flex items-center gap-1 text-yellow-400">
            <Crown className="h-4 w-4" />
            VIP
          </span>
        );
      case 'premium':
        return (
          <span className="flex items-center gap-1 text-purple-400">
            <Diamond className="h-4 w-4" />
            PREMIUM
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-muted-foreground">
            <UserIcon className="h-4 w-4" />
            MEMBER
          </span>
        );
    }
  };

  const filteredTools = tools.filter((tool) => {
    const userLevel = profile?.role || 'member';
    const levelHierarchy = { member: 1, premium: 2, vip: 3 };
    return levelHierarchy[tool.level as keyof typeof levelHierarchy] <= levelHierarchy[userLevel] || true;
  });

  return (
    <div className="relative min-h-screen">
      <VideoBackground />
      <AudioPlayer
        ref={audioRef}
        src="https://files.catbox.moe/4i3vwy.mpeg"
        autoPlay={!isMuted}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <MatrixText text="PlankXploit" className="text-xl" glitch={false} />

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-primary"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <nav className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/ratings')}
                className="text-muted-foreground hover:text-primary"
              >
                <Star className="h-4 w-4 mr-2" />
                Rating
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/chat')}
                className="text-muted-foreground hover:text-primary"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                AI Chat
              </Button>
              {profile?.is_admin && (
                <Button
                  variant="ghost"
                  onClick={() => navigate('/admin')}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="text-destructive hover:text-destructive/80"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 p-4 space-y-2"
          >
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/ratings');
                setIsMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <Star className="h-4 w-4 mr-2" />
              Rating
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigate('/chat');
                setIsMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              AI Chat
            </Button>
            {profile?.is_admin && (
              <Button
                variant="ghost"
                onClick={() => {
                  navigate('/admin');
                  setIsMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </motion.nav>
        )}
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 inline-block">
            <div className="relative">
              <img
                src={profile?.avatar_url || profileLogo}
                alt="Profile"
                className="h-24 w-24 rounded-full border-2 border-primary object-cover pulse-glow"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background px-3 py-1 rounded-full border border-primary text-xs">
                {profile && getRoleBadge(profile.role)}
              </div>
            </div>
          </div>
          <h2 className="text-lg font-display text-primary">
            {profile?.username || 'User'}
          </h2>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 max-w-md mx-auto"
        >
          <div className="text-center mb-4">
            <p className="text-lg text-primary error-flicker glitch font-display">
              MASUKIN NOMOR NYA!
            </p>
            <TypingText
              text="ATAU LU YANG GUA MASUKIN? Ahh Ahh"
              className="text-sm text-muted-foreground"
            />
          </div>

          <div className="cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-4">
            <Input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="628xxxxxxxxxx"
              className="text-center text-lg bg-input/50"
            />
          </div>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-lg font-display text-primary text-center mb-4 text-glow-sm">
            TOOLS AVAILABLE
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTools.map((tool, index) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                userRole={profile?.role || 'member'}
                onClick={() => handleToolClick(tool)}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Video Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h3 className="text-lg font-display text-primary text-center mb-4 text-glow-sm">
            PREVIEW VIDEOS
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'https://files.catbox.moe/73h8it.mp4',
              'https://files.catbox.moe/pzsila.mp4',
              'https://files.catbox.moe/u63jlv.mp4',
              'https://files.catbox.moe/kwqkt2.mp4',
              'https://files.catbox.moe/u4q8mf.mp4',
            ].map((url, index) => (
              <VideoPlayer
                key={index}
                src={url}
                onPlayStateChange={handleVideoPlayStateChange}
              />
            ))}
          </div>
        </motion.div>

        {/* Social Links */}
        <SocialLinks />
      </main>
    </div>
  );
};

export default Dashboard;
