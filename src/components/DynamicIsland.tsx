import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, BookOpen, CheckCircle, ChevronDown, LayoutDashboard, Search, Bookmark, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { FuturisticButton } from './FuturisticButton';
import { cn } from '../lib/utils';

interface DynamicIslandProps {
  stats: {
    totalStudyHours: number;
    classesCompletedToday: number;
    totalClasses: number;
    completedPercentage: number;
  };
  onNavigate: (view: 'dashboard' | 'search' | 'bookmarks') => void;
  onLogout: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({ stats, onNavigate, onLogout }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
      <motion.div
        layout
        initial={false}
        animate={{
          width: isExpanded ? '100%' : '320px',
          maxWidth: isExpanded ? '600px' : '320px',
          height: isExpanded ? 'auto' : '44px',
          borderRadius: isExpanded ? 32 : 22,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 24,
          mass: 0.8,
        }}
        onClick={() => !isExpanded && setIsExpanded(true)}
        className="bg-black/80 backdrop-blur-2xl shadow-2xl cursor-pointer overflow-hidden group relative flex pointer-events-auto"
      >
        {/* Neon Glow Loop Animation */}
        <motion.div
          className="absolute inset-0 rounded-[inherit] border border-neon-blue/30 pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0px rgba(0, 242, 255, 0), inset 0 0 0px rgba(0, 242, 255, 0)',
              '0 0 15px rgba(0, 242, 255, 0.4), inset 0 0 10px rgba(0, 242, 255, 0.2)',
              '0 0 0px rgba(0, 242, 255, 0), inset 0 0 0px rgba(0, 242, 255, 0)',
            ],
            borderColor: [
              'rgba(0, 242, 255, 0.2)',
              'rgba(0, 242, 255, 0.8)',
              'rgba(0, 242, 255, 0.2)',
            ]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <AnimatePresence mode="popLayout">
          {!isExpanded ? (
            <motion.div 
              key="collapsed"
              initial={{ opacity: 0, filter: 'blur(4px)', scale: 0.95 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(4px)', scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="flex items-center justify-between w-full h-[44px] px-4 relative z-10"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-neon-blue animate-pulse" />
                <span className="text-[13px] font-medium text-white/90 tabular-nums">
                  {format(currentTime, 'hh:mm a')}
                </span>
              </div>
              
              <div className="h-4 w-[1px] bg-white/10 mx-2" />
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-white/40" />
                  <span className="text-[13px] font-medium text-white/90">{stats.totalStudyHours}h</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-neon-blue" />
                  <span className="text-[13px] font-medium text-white/90">{stats.classesCompletedToday}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="space-y-6 relative z-10 w-[calc(100vw-3rem)] sm:w-[600px] p-6"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-4 h-4 text-neon-blue" /> Live Status
                  </h3>
                  <p className="text-2xl font-bold tabular-nums text-white">{format(currentTime, 'hh:mm:ss a')}</p>
                  <p className="text-xs text-white/40">{format(currentTime, 'EEEE, MMMM do')}</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                  className="p-2 bg-white/5 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-white/80" />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 bg-white/5 border-white/5 relative overflow-hidden group-hover:border-neon-blue/30 transition-colors">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-neon-blue/10 rounded-full blur-2xl -mr-8 -mt-8" />
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Study Progress</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-white">{stats.completedPercentage}%</span>
                    <span className="text-xs text-neon-blue font-medium">+{stats.classesCompletedToday} today</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completedPercentage}%` }}
                      transition={{ duration: 1, delay: 0.2, type: "spring" }}
                      className="h-full bg-neon-blue shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                    />
                  </div>
                </div>
                <div className="glass-card p-4 bg-white/5 border-white/5 relative overflow-hidden group-hover:border-neon-blue/30 transition-colors">
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-neon-purple/10 rounded-full blur-2xl -mr-8 -mb-8" />
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Total Classes</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-bold text-white">{stats.totalClasses}</span>
                    <BookOpen className="w-5 h-5 text-white/20 mb-1" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <FuturisticButton 
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onNavigate('dashboard'); setIsExpanded(false); }}
                  className="flex-1 py-3"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Dashboard</span>
                </FuturisticButton>
                <FuturisticButton 
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onNavigate('search'); setIsExpanded(false); }}
                  className="flex-1 py-3"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Search</span>
                </FuturisticButton>
                <FuturisticButton 
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onNavigate('bookmarks'); setIsExpanded(false); }}
                  className="flex-1 py-3"
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Saved</span>
                </FuturisticButton>
                <FuturisticButton 
                  variant="secondary"
                  onClick={(e) => { e.stopPropagation(); onLogout(); }}
                  className="flex-none p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
                >
                  <LogOut className="w-4 h-4" />
                </FuturisticButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
