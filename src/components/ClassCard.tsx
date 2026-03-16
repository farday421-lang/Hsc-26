import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactPlayer from 'react-player';
import { FileText, CheckCircle2, Circle, Clock, Bookmark, BookmarkCheck, Trash2, ExternalLink, Sigma } from 'lucide-react';
import { ClassItem, ProgressState } from '../types';
import { FuturisticButton } from './FuturisticButton';
import { FormulaModal } from './FormulaModal';
import { hasFormulas } from '../lib/formulas';
import { cn } from '../lib/utils';

interface ClassCardProps {
  item: ClassItem;
  onUpdateProgress: (id: string, progress: ProgressState) => void;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdatePosition: (id: string, position: number) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ item, onUpdateProgress, onToggleBookmark, onDelete, onUpdatePosition }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const playerRef = useRef<ReactPlayer>(null);

  const handleReady = () => {
    if (item.lastPosition && playerRef.current) {
      playerRef.current.seekTo(item.lastPosition, 'seconds');
    }
  };

  const handlePlay = () => {
    if (item.progress === 'Not Started') {
      onUpdateProgress(item.id, 'Half Completed');
    }
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    onUpdatePosition(item.id, state.playedSeconds);
  };

  const handleEnded = () => {
    onUpdateProgress(item.id, 'Completed');
    onUpdatePosition(item.id, 0);
  };

  const progressPercentage = item.progress === 'Completed' ? 100 : item.progress === 'Half Completed' ? 50 : 0;

  return (
    <motion.div
      layout
      id={`class-${item.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-card group relative flex flex-col h-full transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(0,242,255,0.3)] bg-gradient-to-b from-white/5 to-transparent border-white/10 hover:border-neon-blue/50 overflow-hidden rounded-2xl"
    >
      {/* Video Player Section */}
      <div className="aspect-video w-full bg-brand-black relative overflow-hidden">
        {item.youtubeUrl ? (
          <ReactPlayer
            ref={playerRef}
            url={item.youtubeUrl}
            width="100%"
            height="100%"
            controls={true}
            onReady={handleReady}
            onPlay={handlePlay}
            onProgress={handleProgress}
            onEnded={handleEnded}
            progressInterval={5000}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 bg-white/5">
            Invalid Video URL
          </div>
        )}
        
        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/10 backdrop-blur-sm pointer-events-none">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            className={cn(
              "h-full transition-all duration-1000 ease-out relative",
              item.progress === 'Completed' ? "bg-green-500" : "bg-neon-blue"
            )}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex-1 flex flex-col space-y-5 relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-[9px] font-bold text-neon-blue uppercase tracking-widest">
                {item.subject}
              </span>
            </div>
            <h3 className="text-lg font-bold leading-tight line-clamp-2 group-hover:text-neon-blue transition-colors duration-300">
              {item.title}
            </h3>
          </div>
          <button 
            onClick={() => onToggleBookmark(item.id)}
            className="p-2.5 rounded-full bg-white/5 hover:bg-neon-blue/20 border border-white/10 hover:border-neon-blue/50 transition-all duration-300 shrink-0 group/btn"
          >
            {item.isBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-neon-blue" />
            ) : (
              <Bookmark className="w-4 h-4 text-white/40 group-hover/btn:text-neon-blue" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-5 text-xs text-white/50 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-white/30" />
            <span>{new Date(item.dateAdded).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.progress === 'Completed' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : item.progress === 'Half Completed' ? (
              <Circle className="w-3.5 h-3.5 text-neon-blue fill-neon-blue/20" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-white/20" />
            )}
            <span className={cn(
              "font-semibold tracking-wide",
              item.progress === 'Completed' ? "text-green-500" : 
              item.progress === 'Half Completed' ? "text-neon-blue" : "text-white/40"
            )}>
              {item.progress}
            </span>
          </div>
        </div>

        <div className="pt-4 mt-auto flex flex-wrap items-center gap-2 border-t border-white/5">
          {item.pdfUrl && (
            <FuturisticButton 
              variant="secondary"
              onClick={() => window.open(item.pdfUrl, '_blank')}
              className="flex-1 py-2 min-w-[100px] text-xs bg-white/5 hover:bg-white/10"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Notes
            </FuturisticButton>
          )}
          {hasFormulas(item.subject) && (
            <FuturisticButton 
              variant="secondary"
              onClick={() => setIsFormulaModalOpen(true)}
              className="flex-1 py-2 min-w-[100px] text-xs bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border-neon-blue/20"
            >
              <Sigma className="w-3.5 h-3.5 mr-1.5" />
              Formulas
            </FuturisticButton>
          )}
          <button 
            onClick={() => onDelete(item.id)}
            className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-colors"
            title="Delete Class"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Formula Modal */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        subject={item.subject}
        title={item.title}
      />
    </motion.div>
  );
};
