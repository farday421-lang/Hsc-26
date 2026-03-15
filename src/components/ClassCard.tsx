import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import YouTube, { YouTubeProps } from 'react-youtube';
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
  const [player, setPlayer] = useState<any>(null);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  // Extract video ID from YouTube URL
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(item.youtubeUrl);

  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    setPlayer(event.target);
    if (item.lastPosition) {
      event.target.seekTo(item.lastPosition, true);
    }
  };

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    // 1 = playing, 2 = paused, 0 = ended
    if (event.data === 1) {
      if (item.progress === 'Not Started') {
        onUpdateProgress(item.id, 'Half Completed');
      }
      // Start interval to save position while playing
      const interval = setInterval(() => {
        if (event.target && event.target.getCurrentTime) {
          onUpdatePosition(item.id, event.target.getCurrentTime());
        }
      }, 5000);
      
      // Store interval on player object to clear it later
      (event.target as any)._posInterval = interval;
    } else {
      // Clear interval when not playing
      if ((event.target as any)._posInterval) {
        clearInterval((event.target as any)._posInterval);
      }
      
      if (event.data === 0) {
        onUpdateProgress(item.id, 'Completed');
        onUpdatePosition(item.id, 0);
      } else if (event.data === 2) {
        // Paused
        onUpdatePosition(item.id, event.target.getCurrentTime());
      }
    }
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
      className="glass-card group relative overflow-hidden flex flex-col h-full"
    >
      {/* Video Player Section */}
      <div className="aspect-video w-full bg-black/40 relative overflow-hidden rounded-t-2xl">
        {videoId ? (
          <YouTube
            videoId={videoId}
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 0,
                modestbranding: 1,
                rel: 0,
              },
            }}
            className="w-full h-full"
            onReady={onPlayerReady}
            onStateChange={onPlayerStateChange}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            Invalid YouTube URL
          </div>
        )}
        
        {/* Progress Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            className={cn(
              "h-full transition-all duration-500",
              item.progress === 'Completed' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-neon-blue"
            )}
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex-1 flex flex-col space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neon-blue uppercase tracking-widest">{item.subject}</span>
            <h3 className="text-base font-bold line-clamp-2 group-hover:text-neon-blue transition-colors">{item.title}</h3>
          </div>
          <button 
            onClick={() => onToggleBookmark(item.id)}
            className="p-2 rounded-full hover:bg-white/5 transition-colors"
          >
            {item.isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 text-neon-blue" />
            ) : (
              <Bookmark className="w-5 h-5 text-white/20" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-white/40 font-medium">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Added {new Date(item.dateAdded).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {item.progress === 'Completed' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            ) : item.progress === 'Half Completed' ? (
              <Circle className="w-3.5 h-3.5 text-neon-blue fill-neon-blue/20" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
            <span className={cn(
              item.progress === 'Completed' ? "text-green-500" : 
              item.progress === 'Half Completed' ? "text-neon-blue" : ""
            )}>
              {item.progress}
            </span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2">
          {item.pdfUrl && (
            <FuturisticButton 
              variant="secondary"
              onClick={() => window.open(item.pdfUrl, '_blank')}
              className="flex-1 py-2.5 min-w-[120px]"
            >
              <FileText className="w-4 h-4" />
              Notes PDF
            </FuturisticButton>
          )}
          {hasFormulas(item.subject) && (
            <FuturisticButton 
              variant="secondary"
              onClick={() => setIsFormulaModalOpen(true)}
              className="flex-1 py-2.5 min-w-[120px] bg-neon-blue/10 hover:bg-neon-blue/20 text-neon-blue border-neon-blue/20"
            >
              <Sigma className="w-4 h-4" />
              Sutro & Math
            </FuturisticButton>
          )}
          <FuturisticButton 
            variant="secondary"
            onClick={() => onDelete(item.id)}
            className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </FuturisticButton>
        </div>
      </div>

      {/* Hover Glow Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none border-2 border-neon-blue/20 rounded-2xl"
          />
        )}
      </AnimatePresence>

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
