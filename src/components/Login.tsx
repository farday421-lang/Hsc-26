import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Fingerprint, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { playSuccessSound } from '../lib/sounds';

interface SlideToLoginProps {
  onLogin: (username: string) => Promise<boolean>;
  onCreateAccount: (username: string) => Promise<boolean>;
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
  const [isCreating, setIsCreating] = useState(false);
  const [puzzle, setPuzzle] = useState({ a: 0, b: 0, op: '+', ans: 0 });
  const [answer, setAnswer] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generatePuzzle();
  }, []);

  const generatePuzzle = () => {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, ans;
    if (op === '+') {
      a = Math.floor(Math.random() * 20) + 10;
      b = Math.floor(Math.random() * 20) + 10;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 30) + 20;
      b = Math.floor(Math.random() * 19) + 1;
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 8) + 2;
      b = Math.floor(Math.random() * 8) + 2;
      ans = a * b;
    }
    setPuzzle({ a, b, op, ans });
    setAnswer('');
  };

  useEffect(() => {
    if (answer !== '' && parseInt(answer) === puzzle.ans && username.trim().length > 0) {
      handleUnlock();
    }
  }, [answer]);

  const handleUnlock = async () => {
    setIsUnlocked(true);
    setIsLoading(true);
    playSuccessSound();

    // Small delay for visual effect
    await new Promise(r => setTimeout(r, 800));

    const success = isCreating
      ? await onCreateAccount(username.trim())
      : await onLogin(username.trim());

    if (!success) {
      setIsUnlocked(false);
      setIsLoading(false);
      generatePuzzle();
      setAnswer('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-neon-blue/30">
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
        className="glass-card w-full max-w-md p-8 relative z-10 overflow-hidden shadow-[0_0_50px_rgba(0,242,255,0.05)]"
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue to-neon-purple" />

        <div className="text-center mb-10">
          <motion.div
            animate={{
              boxShadow: ["0 0 20px rgba(0,242,255,0.1)", "0 0 40px rgba(188,19,254,0.2)", "0 0 20px rgba(0,242,255,0.1)"]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 mx-auto bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-6 backdrop-blur-md"
          >
            <Brain className="w-10 h-10 text-neon-blue" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Study Gateway</h2>
          <p className="text-white/40 text-sm font-medium">Verify your neural link to continue</p>
        </div>

        <div className="space-y-8">
          {/* Username Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-neon-blue uppercase tracking-[0.2em] ml-1">
              {isCreating ? "New Student ID" : "Student ID"}
            </label>
            <div className="relative group">
              <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-neon-blue transition-colors" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your ID..."
                className="w-full bg-black/50 border-2 border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-neon-blue/50 transition-all text-white placeholder:text-white/20 font-medium"
                disabled={isUnlocked || isLoading}
              />
            </div>
          </div>

          {/* Puzzle Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-neon-purple uppercase tracking-[0.2em]">
                Security Puzzle
              </label>
              <button
                onClick={generatePuzzle}
                disabled={isUnlocked || isLoading}
                className="text-[10px] font-bold text-white/40 hover:text-white uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            <div className={cn(
              "relative overflow-hidden rounded-2xl border-2 transition-all duration-500",
              isUnlocked ? "border-neon-blue bg-neon-blue/10 shadow-[0_0_30px_rgba(0,242,255,0.3)]" : "border-white/10 bg-black/50",
              !username.trim() && "opacity-50 grayscale pointer-events-none"
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
                      className="flex flex-col items-center gap-3"
                    >
                      {isLoading ? (
                        <Loader2 className="w-10 h-10 text-neon-blue animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-10 h-10 text-neon-blue" />
                      )}
                      <span className="text-neon-blue font-bold tracking-[0.2em] uppercase text-xs">
                        {isLoading ? "Authenticating..." : "Access Granted"}
                      </span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3 text-2xl font-mono font-bold text-white">
                  <span className="bg-white/10 px-4 py-2 rounded-xl shadow-inner">{puzzle.a}</span>
                  <span className="text-neon-purple">{puzzle.op}</span>
                  <span className="bg-white/10 px-4 py-2 rounded-xl shadow-inner">{puzzle.b}</span>
                  <span className="text-white/40">=</span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="?"
                  disabled={isUnlocked || isLoading || !username.trim()}
                  className={cn(
                    "w-20 bg-white/5 border-2 rounded-xl text-center text-2xl font-mono py-2 transition-all outline-none shadow-inner",
                    answer && parseInt(answer) !== puzzle.ans ? "border-red-500/50 text-red-400 bg-red-500/10" : "border-white/10 focus:border-neon-blue text-neon-blue focus:bg-neon-blue/5"
                  )}
                />
              </div>
            </div>
            {!username.trim() && (
              <p className="text-xs text-neon-purple text-center mt-3 animate-pulse font-medium">
                Enter Student ID to activate puzzle
              </p>
            )}
            {username.trim() && !isUnlocked && (
              <p className="text-xs text-white/40 text-center mt-3 font-medium">
                Solve the equation to automatically login
              </p>
            )}
          </div>
        </div>

        {/* Toggle Mode */}
        <div className="mt-10 pt-6 border-t border-white/5 text-center">
          <button
            onClick={() => {
              setIsCreating(!isCreating);
              setUsername('');
              setAnswer('');
              generatePuzzle();
            }}
            disabled={isUnlocked || isLoading}
            className="text-xs font-bold text-white/40 hover:text-neon-blue uppercase tracking-widest transition-colors"
          >
            {isCreating ? "Already registered? Login here" : "New student? Create Account"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
