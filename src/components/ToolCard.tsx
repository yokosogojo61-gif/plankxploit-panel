import { motion } from 'framer-motion';
import { LucideIcon, Lock } from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  icon: LucideIcon;
  category: string;
  level: string;
  description: string;
}

interface ToolCardProps {
  tool: Tool;
  userRole: string;
  onClick: () => void;
  index: number;
}

const ToolCard = ({ tool, userRole, onClick, index }: ToolCardProps) => {
  const levelHierarchy = { member: 1, premium: 2, vip: 3 };
  const isLocked =
    levelHierarchy[tool.level as keyof typeof levelHierarchy] >
    levelHierarchy[userRole as keyof typeof levelHierarchy];

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

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative p-4 rounded-lg border ${getLevelColor(
        tool.level
      )} backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${
        isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
          <Lock className="h-6 w-6 text-muted-foreground" />
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <div
          className={`p-3 rounded-full ${
            tool.level === 'vip'
              ? 'bg-yellow-500/20'
              : tool.level === 'premium'
              ? 'bg-purple-500/20'
              : 'bg-primary/20'
          }`}
        >
          <tool.icon
            className={`h-6 w-6 ${
              tool.level === 'vip'
                ? 'text-yellow-400'
                : tool.level === 'premium'
                ? 'text-purple-400'
                : 'text-primary'
            }`}
          />
        </div>
        <span className="text-sm font-display text-foreground">{tool.name}</span>
        {getLevelBadge(tool.level)}
        <span className="text-xs text-muted-foreground text-center">
          {tool.description}
        </span>
      </div>
    </motion.button>
  );
};

export default ToolCard;
