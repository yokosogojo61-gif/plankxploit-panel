import { motion } from 'framer-motion';
import { Phone, MessageSquare, Instagram, Music2, Globe } from 'lucide-react';

const socialLinks = [
  {
    name: 'WhatsApp',
    icon: Phone,
    url: 'https://wa.me/6208881382817',
    color: 'hover:text-green-400',
  },
  {
    name: 'Saluran WA',
    icon: MessageSquare,
    url: 'https://whatsapp.com/channel/0029Vay9jnG65yDFJDN6tG1j',
    color: 'hover:text-green-400',
  },
  {
    name: 'Instagram',
    icon: Instagram,
    url: 'https://www.instagram.com/anonymous_81bs?igsh=OHlhcWo5YnZiNTgz',
    color: 'hover:text-pink-400',
  },
  {
    name: 'TikTok',
    icon: Music2,
    url: 'https://vm.tiktok.com/ZSHwxsburhLMX-27XkO/',
    color: 'hover:text-cyan-400',
  },
];

const SocialLinks = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8 border-t border-border/50"
    >
      <h3 className="text-center text-lg font-display text-primary mb-6 text-glow-sm">
        CONTACT SUPPORT
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        {socialLinks.map((link, index) => (
          <motion.a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm text-muted-foreground transition-colors ${link.color}`}
          >
            <link.icon className="h-5 w-5" />
            <span className="text-sm">{link.name}</span>
          </motion.a>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        <p>© 2024 PlankXploit by PLANK DEV</p>
        <p className="mt-1">All Rights Reserved</p>
      </div>
    </motion.div>
  );
};

export default SocialLinks;
