import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Fingerprint, Lock, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { playSuccessSound } from '../lib/sounds';

interface SlideToLoginProps {
  onLogin: (username: string, password?: string) => Promise<boolean>;
  onCreateAccount: (username: string, password?: string) => Promise<boolean>;
}

const SYMBOLS = [
  { char: '∑', size: 'text-4xl', top: '15%', left: '10%', duration: 15 },
  { char: '∫', size: 'text-6xl', top: '20%', left: '80%', duration: 20 },
  { char: 'π', size: 'text-5xl', top: '70%', left: '15%', duration: 18 },
  { char: '∞', size: 'text-7xl', top: '80%', left: '85%', duration: 25 },
  { char: '∆', size: 'text-3xl', top: '40%', left: '90%', duration: 12 },
  { char: '√', size: 'text-5xl', top: '60%', left: '5%', duration: 22 },
  { char: 'θ', size: 'text-4xl', top: '30%', left: '25%', duration: 17 },
  { char: 'λ', size: 'text-6xl', top: '85%', left: '50%', duration: 19 },
];

export const Login: React.FC<SlideToLoginProps> = ({ onLogin, onCreateAccount }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [answer, setAnswer] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setAnswer('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      alert("Please enter both ID and Password.");
      return;
    }
    if (answer.toUpperCase() !== captcha) {
      alert("Incorrect security code.");
      generateCaptcha();
      return;
    }

    setIsUnlocked(true);
    setIsLoading(true);
    playSuccessSound();

    // Small delay for visual effect
    await new Promise(r => setTimeout(r, 800));

    const success = isCreating
      ? await onCreateAccount(username.trim(), password.trim())
      : await onLogin(username.trim(), password.trim());

    if (!success) {
      setIsUnlocked(false);
      setIsLoading(false);
      generateCaptcha();
      setAnswer('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-neon-blue/30">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Neon Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-blue/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-purple/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Floating Math Symbols */}
      {SYMBOLS.map((sym, i) => (
        <motion.div
          key={i}
          className={cn("absolute text-white/5 font-serif pointer-events-none select-none", sym.size)}
          style={{ top: sym.top, left: sym.left }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: sym.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {sym.char}
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-sm p-6 relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.05)]"
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue to-neon-purple" />

        <div className="text-center mb-6">
          <motion.div
            animate={{
              boxShadow: ["0 0 20px rgba(0,242,255,0.1)", "0 0 40px rgba(188,19,254,0.2)", "0 0 20px rgba(0,242,255,0.1)"]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-16 h-16 mx-auto bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-4 backdrop-blur-md"
          >
            <Brain className="w-8 h-8 text-neon-blue" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Study Gateway</h2>
          <p className="text-white/40 text-xs font-medium">Verify your neural link to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neon-blue uppercase tracking-[0.2em] ml-1">
              {isCreating ? "New Student ID" : "Student ID"}
            </label>
            <div className="relative group">
              <Fingerprint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-blue transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your ID..."
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-neon-blue/50 transition-all text-white placeholder:text-white/20 font-medium"
                disabled={isUnlocked || isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-neon-purple uppercase tracking-[0.2em] ml-1">
              Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-neon-purple transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-neon-purple/50 transition-all text-white placeholder:text-white/20 font-medium"
                disabled={isUnlocked || isLoading}
              />
            </div>
          </div>

          {/* Puzzle Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-[0.2em]">
                Security Code
              </label>
              <button
                type="button"
                onClick={generateCaptcha}
                disabled={isUnlocked || isLoading}
                className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className={cn(
              "relative overflow-hidden rounded-lg border transition-all duration-500",
              isUnlocked ? "border-neon-blue bg-neon-blue/10 shadow-[0_0_30px_rgba(0,242,255,0.3)]" : "border-white/10 bg-black/50",
              (!username.trim() || !password.trim()) && "opacity-50 grayscale pointer-events-none"
            )}>
              {/* Unlocked Overlay */}
              <AnimatePresence>
                {isUnlocked && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-brand-black/90 backdrop-blur-md"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="flex flex-col items-center gap-2"
                    >
                      {isLoading ? (
                         <Loader2 className="w-8 h-8 text-neon-blue animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-neon-blue" />
                      )}
                      <span className="text-neon-blue font-bold tracking-[0.2em] uppercase text-[10px]">
                        {isLoading ? "Authenticating..." : "Access Granted"}
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-3 flex items-center justify-between relative z-10 gap-3">
                <div className="flex-1 flex items-center justify-center bg-white/5 py-2 rounded-md border border-white/5">
                  <span className="text-xl font-mono font-bold tracking-[0.3em] text-white/80 select-none">
                    {captcha}
                  </span>
                </div>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                  placeholder="CODE"
                  maxLength={4}
                  disabled={isUnlocked || isLoading || !username.trim() || !password.trim()}
                  className={cn(
                    "w-24 bg-white/5 border rounded-md text-center text-sm font-mono py-2 transition-all outline-none shadow-inner uppercase",
                    answer && answer !== captcha ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-white/10 focus:border-neon-blue text-neon-blue focus:bg-neon-blue/5"
                  )}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUnlocked || isLoading || !username.trim() || !password.trim() || !answer.trim()}
            className="w-full py-3 mt-4 rounded-lg font-bold text-white text-sm tracking-widest uppercase bg-gradient-to-r from-gray-900 to-gray-700 hover:from-black hover:to-gray-800 transition-all shadow-lg border border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Create Account" : "Login"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 pt-4 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsCreating(!isCreating);
              setUsername('');
              setPassword('');
              setAnswer('');
              generateCaptcha();
            }}
            disabled={isUnlocked || isLoading}
            className="text-[10px] font-bold text-white/40 hover:text-neon-blue uppercase tracking-widest transition-colors"
          >
            {isCreating ? "Already registered? Login here" : "New student? Create Account"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
