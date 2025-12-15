import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import VideoBackground from '@/components/VideoBackground';
import MatrixText from '@/components/MatrixText';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatAI = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: { messages: [...messages, { role: 'user', content: userMessage }] },
      });
      if (data?.content) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <VideoBackground />
      <div className="container mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col">
        <MatrixText text="AI CHAT" className="text-3xl text-center mb-4" />
        <div className="flex-1 cyber-border rounded-lg bg-card/80 backdrop-blur-sm p-4 overflow-y-auto mb-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary/20 ml-auto' : 'bg-secondary/50'} max-w-[80%]`}
            >
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </motion.div>
          ))}
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ketik pesan..."
            className="bg-input/50"
          />
          <Button onClick={sendMessage} disabled={isLoading} className="pulse-glow">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatAI;
