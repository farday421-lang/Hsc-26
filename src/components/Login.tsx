import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { playSuccessSound } from '../lib/sounds';
import { FuturisticButton } from './FuturisticButton';

interface SlideToLoginProps {
  onLogin: (username: string) => Promise<boolean>;
  onCreateAccount: (username: string) => Promise<boolean>;
}

export const Login: React.FC<SlideToLoginProps> = ({ onLogin, onCreateAccount }) => {
  const [username, setUsername] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 250], ["rgba(0, 242, 255, 0)", "rgba(0, 242, 255, 0.3)"]);
  const textOpacity = useTransform(x, [0, 150], [1, 0]);
  const fillWidth = useTransform(x, x => x + 48); // 48 is the width of the drag button

  const handleDragEnd = async (event: any, info: any) => {
    if (!username.trim()) {
      x.set(0);
      return;
    }

    if (info.offset.x > 200) {
      setIsLoading(true);
      const success = isCreating 
        ? await onCreateAccount(username.trim()) 
        : await onLogin(username.trim());
        
      if (success) {
        setIsSuccess(true);
        playSuccessSound();
      } else {
        x.set(0);
      }
      setIsLoading(false);
    } else {
      x.set(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-black relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 z-10"
      >
        <div className="text-center space-y-2">
          <motion.h1 
            className="text-5xl font-bold tracking-tighter neon-text bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            HSC 2026
          </motion.h1>
          <p className="text-white/40 text-sm uppercase tracking-[0.2em]">Future-Ready Study Hub</p>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-8 space-y-6"
            >
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-white/40 uppercase tracking-wider ml-1">
                    {isCreating ? "Choose Username" : "Username"}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue/50 transition-all text-white placeholder:text-white/20"
                  />
                </div>

                <div 
                  ref={containerRef}
                  className="relative h-14 bg-white/5 rounded-full border border-white/10 overflow-hidden flex items-center px-1"
                >
                  <motion.div 
                    style={{ background, width: fillWidth }} 
                    className="absolute left-0 top-0 bottom-0 rounded-full pointer-events-none" 
                  />
                  
                  <motion.div 
                    style={{ opacity: textOpacity }} 
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  >
                    <span className={cn(
                      "text-sm font-medium transition-colors",
                      username.trim() ? "text-white/80" : "text-white/30"
                    )}>
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-neon-blue" />
                      ) : (
                        !username.trim() ? "Enter Username First" : (isCreating ? "Slide to Create Account" : "Slide to Login")
                      )}
                    </span>
                  </motion.div>

                  <motion.div
                    drag={username.trim() && !isLoading ? "x" : false}
                    dragConstraints={containerRef}
                    dragElastic={0.1}
                    onDragEnd={handleDragEnd}
                    style={{ x }}
                    whileHover={username.trim() && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={username.trim() && !isLoading ? { scale: 0.95 } : {}}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center z-10 shadow-[0_0_20px_rgba(0,255,255,0.2)] transition-colors",
                      username.trim() && !isLoading ? "bg-white cursor-grab active:cursor-grabbing" : "bg-white/20 cursor-not-allowed"
                    )}
                  >
                    <ChevronRight className={cn("w-6 h-6", username.trim() && !isLoading ? "text-brand-black" : "text-white/50")} />
                  </motion.div>
                </div>
              </div>

              <div className="text-center">
                <FuturisticButton 
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(!isCreating);
                    x.set(0);
                  }}
                  className="w-full"
                >
                  {isCreating ? "Already have an account? Login" : "New here? Create Account"}
                </FuturisticButton>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-12"
            >
              <div className="w-20 h-20 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto neon-glow">
                <motion.div
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Sparkles className="w-10 h-10 text-neon-blue" />
                </motion.div>
              </div>
              <motion.h2 
                className="text-3xl font-bold"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Welcome {isCreating ? "" : "Back"}, {username}!
              </motion.h2>
              <motion.p 
                className="text-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Preparing your futuristic study hub...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
