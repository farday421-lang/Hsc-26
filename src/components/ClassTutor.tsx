import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ClassItem } from '../types';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface ClassTutorProps {
  item: ClassItem;
  onClose: () => void;
}

export const ClassTutor: React.FC<ClassTutorProps> = ({ item, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Hello! I'm your AI Tutor. I can help you understand the concepts in "${item.title}" (${item.subject}). What would you like to know?`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are a helpful, expert tutor for HSC 2026 students in Bangladesh. 
The student is currently watching a class titled "${item.title}" on the subject "${item.subject}".
Answer their questions specifically related to this topic. Be concise, encouraging, and clear.`;
      
      chatRef.current = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
        }
      });
    }
  }, [item]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: userMsg });

      if (response.text) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: response.text as string }]);
      } else {
        throw new Error("No response text");
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        text: "Sorry, I encountered an error while trying to answer. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-white/10 bg-white/5 flex flex-col"
    >
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-2 text-neon-blue">
          <Bot className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">AI Tutor</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 h-64 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex gap-3 text-sm", msg.role === 'user' ? "flex-row-reverse" : "")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              msg.role === 'user' ? "bg-neon-purple/20 text-neon-purple" : "bg-neon-blue/20 text-neon-blue"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "px-4 py-2 rounded-2xl max-w-[80%]",
              msg.role === 'user' 
                ? "bg-neon-purple/20 text-white rounded-tr-sm" 
                : "bg-white/10 text-white/90 rounded-tl-sm"
            )}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/10 text-white/90 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
              <span className="text-xs text-white/40">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/5 bg-black/20 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about this class..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-blue/50 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          className="w-10 h-10 rounded-xl bg-neon-blue/20 text-neon-blue flex items-center justify-center hover:bg-neon-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
