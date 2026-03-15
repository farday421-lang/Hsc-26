import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Plus, BookOpen, CheckCircle2, Circle, Clock, LayoutGrid, List, AlertCircle } from 'lucide-react';
import { UserData, ClassItem, Subject, ProgressState } from '../types';
import { ClassCard } from './ClassCard';
import { FuturisticButton } from './FuturisticButton';
import { playSlideSound } from '../lib/sounds';
import { cn } from '../lib/utils';

interface DashboardProps {
  userData: UserData;
  onUpdateClass: (id: string, updates: Partial<ClassItem>) => void;
  onDeleteClass: (id: string) => void;
  onAddClass: () => void;
}

const SUBJECTS: Subject[] = [
  'Bangla', 'English', 'ICT', 
  'Higher Math 1st Paper', 'Higher Math 2nd Paper',
  'Physics 1st Paper', 'Physics 2nd Paper',
  'Chemistry 1st Paper', 'Chemistry 2nd Paper'
];

export const Dashboard: React.FC<DashboardProps> = ({ userData, onUpdateClass, onDeleteClass, onAddClass }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredClasses = useMemo(() => {
    return userData.classes.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || c.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [userData.classes, searchQuery, selectedSubject]);

  const stats = useMemo(() => {
    const total = userData.classes.length;
    const completed = userData.classes.filter(c => c.progress === 'Completed').length;
    const half = userData.classes.filter(c => c.progress === 'Half Completed').length;
    const notStarted = userData.classes.filter(c => c.progress === 'Not Started').length;
    
    return { total, completed, half, notStarted };
  }, [userData.classes]);

  const unfinishedClasses = userData.classes.filter(c => c.progress === 'Half Completed');

  const handleSubjectChange = (subject: Subject | 'All') => {
    console.log('Subject clicked:', subject);
    if (selectedSubject !== subject) {
      try {
        playSlideSound();
      } catch (e) {
        console.warn('Sound failed', e);
      }
      setSelectedSubject(subject);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Classes', value: stats.total, icon: BookOpen, color: 'text-white' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-500' },
          { label: 'In Progress', value: stats.half, icon: Circle, color: 'text-neon-blue' },
          { label: 'Not Started', value: stats.notStarted, icon: Clock, color: 'text-white/40' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col items-center text-center space-y-2"
          >
            <stat.icon className={cn("w-6 h-6 mb-2", stat.color)} />
            <span className="text-3xl font-bold">{stat.value}</span>
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{stat.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Resume Section */}
      <AnimatePresence>
        {unfinishedClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-neon-blue" />
              <h2 className="text-xl font-bold uppercase tracking-wider">Continue Learning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unfinishedClasses.map(c => (
                <div key={c.id} className="glass-card p-4 flex items-center justify-between gap-4 group hover:border-neon-blue/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">{c.subject}</span>
                    <h4 className="text-sm font-bold truncate">{c.title}</h4>
                  </div>
                  <FuturisticButton 
                    onClick={() => {
                      const element = document.getElementById(`class-${c.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Add a temporary highlight effect
                        element.classList.add('ring-2', 'ring-neon-blue', 'ring-offset-4', 'ring-offset-brand-black');
                        setTimeout(() => {
                          element.classList.remove('ring-2', 'ring-neon-blue', 'ring-offset-4', 'ring-offset-brand-black');
                        }, 2000);
                      }
                    }}
                    className="px-4 py-2 text-xs h-9"
                    showAnimatedBorder
                  >
                    Resume
                  </FuturisticButton>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders */}
      <AnimatePresence>
        {unfinishedClasses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card bg-neon-blue/5 border-neon-blue/20 p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-neon-blue" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-neon-blue">Resume Your Learning</h4>
              <p className="text-xs text-white/60">You have {unfinishedClasses.length} unfinished classes. Keep going!</p>
            </div>
            <FuturisticButton 
              onClick={() => {
                console.log('Add Class button clicked (reminder)');
                onAddClass();
              }}
              showAnimatedBorder
              className="px-4 py-2"
            >
              Add More
            </FuturisticButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-neon-blue/50 transition-all text-sm"
            />
          </div>
          <FuturisticButton 
            onClick={() => {
              console.log('Add Class button clicked (top)');
              onAddClass();
            }}
            className="p-3 aspect-square"
          >
            <Plus className="w-6 h-6" />
          </FuturisticButton>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-4 md:pb-0 custom-scrollbar scroll-smooth relative z-10">
          <motion.div 
            className="flex items-center gap-3 px-2"
            layout
          >
            <button
              onClick={() => handleSubjectChange('All')}
              className={cn(
                "relative h-12 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap group",
                selectedSubject === 'All' 
                  ? "text-brand-black" 
                  : "text-white/40 hover:text-white"
              )}
            >
              {/* 3D Depth Layer */}
              <div className={cn(
                "absolute inset-0 rounded-xl translate-y-1 transition-transform group-active:translate-y-0.5",
                selectedSubject === 'All' ? "bg-white/20" : "bg-white/5"
              )} />
              
              {/* Main Button Layer */}
              <div className={cn(
                "relative h-full px-6 flex items-center justify-center rounded-xl border transition-all duration-200 group-active:translate-y-0.5 overflow-hidden",
                selectedSubject === 'All' 
                  ? "bg-white border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]" 
                  : "bg-brand-black border-white/10 hover:border-white/20"
              )}>
                {selectedSubject === 'All' && (
                  <motion.div 
                    layoutId="active-subject-bg"
                    className="absolute inset-0 bg-white"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">All Subjects</span>
              </div>
            </button>

            {SUBJECTS.map(s => (
              <button
                key={s}
                onClick={() => handleSubjectChange(s)}
                className={cn(
                  "relative h-12 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap group",
                  selectedSubject === s 
                    ? "text-brand-black" 
                    : "text-white/40 hover:text-white"
                )}
              >
                {/* 3D Depth Layer */}
                <div className={cn(
                  "absolute inset-0 rounded-xl translate-y-1 transition-transform group-active:translate-y-0.5",
                  selectedSubject === s ? "bg-neon-blue/20" : "bg-white/5"
                )} />

                {/* Main Button Layer */}
                <div className={cn(
                  "relative h-full px-6 flex items-center justify-center rounded-xl border transition-all duration-200 group-active:translate-y-0.5 overflow-hidden",
                  selectedSubject === s 
                    ? "bg-neon-blue border-neon-blue shadow-[0_0_20px_rgba(0,242,255,0.3)]" 
                    : "bg-brand-black border-white/10 hover:border-white/20"
                )}>
                  {selectedSubject === s && (
                    <motion.div 
                      layoutId="active-subject-bg"
                      className="absolute inset-0 bg-neon-blue"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{s}</span>
                </div>
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredClasses.map((item) => (
            <ClassCard
              key={item.id}
              item={item}
              onUpdateProgress={(id, progress) => onUpdateClass(id, { progress })}
              onToggleBookmark={(id) => onUpdateClass(id, { isBookmarked: !item.isBookmarked })}
              onDelete={onDeleteClass}
              onUpdatePosition={(id, lastPosition) => onUpdateClass(id, { lastPosition })}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredClasses.length === 0 && (
        <div className="text-center py-24 space-y-4">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10 text-white/10" />
          </div>
          <h3 className="text-xl font-bold text-white/40">No classes found</h3>
          <p className="text-sm text-white/20">Try adjusting your search or add a new class.</p>
          <div className="flex justify-center">
            <FuturisticButton 
              variant="outline"
              onClick={() => {
                console.log('Add Class button clicked (empty state)');
                onAddClass();
              }}
              showAnimatedBorder
            >
              Add Your First Class
            </FuturisticButton>
          </div>
        </div>
      )}
    </div>
  );
};
