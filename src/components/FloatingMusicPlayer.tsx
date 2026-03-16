import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, X, Search, Youtube, Maximize2, Minimize2, Sparkles, Loader2, Play } from 'lucide-react';

interface YTVideo {
  videoId: string;
  title: string;
  thumbnail: string;
  author: { name: string };
  duration: { timestamp: string };
}

export function FloatingMusicPlayer() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<YTVideo[]>([]);
  const [currentVideo, setCurrentVideo] = useState<YTVideo | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchInput)}`);
      const data = await res.json();
      if (data.videos) {
        setResults(data.videos);
        if (data.videos.length > 0 && !currentVideo) {
          setCurrentVideo(data.videos[0]);
        }
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      <motion.div
        initial={false}
        animate={{ 
          opacity: isOpen ? 1 : 0, 
          y: isOpen ? 0 : 20, 
          scale: isOpen ? 1 : 0.9, 
          filter: isOpen ? 'blur(0px)' : 'blur(10px)',
          pointerEvents: isOpen ? 'auto' : 'none',
          width: isExpanded ? 'min(90vw, 800px)' : 'min(85vw, 340px)',
          height: isExpanded ? 'min(70vh, 600px)' : '460px',
        }}
        transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
        className="mb-6 bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(0,255,255,0.15)] overflow-hidden flex flex-col origin-bottom-right pointer-events-auto"
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-neon-blue/5 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-red-900/20 border border-red-500/20">
              <Youtube className="w-4 h-4 text-red-500" />
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-md animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-wide text-xs">YT Music</h3>
              <p className="text-[9px] text-neon-blue uppercase tracking-widest font-semibold">Background Player</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors text-white/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 pb-2">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-0 bg-neon-blue/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <div className="relative flex items-center bg-black/50 border border-white/10 rounded-xl overflow-hidden focus-within:border-neon-blue/50 transition-colors">
              <div className="pl-3 pr-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-neon-blue animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-white/40 group-focus-within:text-neon-blue transition-colors" />
                )}
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search song or lofi..."
                className="w-full py-2.5 pr-3 bg-transparent text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="px-3 py-1.5 mr-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white/80 text-[10px] font-semibold rounded-lg transition-colors uppercase tracking-wider"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Player & Results */}
        <div className="flex-1 p-4 pt-2 flex flex-col gap-3 overflow-hidden">
          {/* Results List */}
          {results.length > 0 && (
            <div className="flex-shrink-0 max-h-[120px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {results.map(video => (
                <div
                  key={video.videoId}
                  onClick={() => setCurrentVideo(video)}
                  className={`flex items-center gap-2.5 p-1.5 rounded-lg cursor-pointer transition-colors ${
                    currentVideo?.videoId === video.videoId ? 'bg-neon-blue/20 border border-neon-blue/30' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <img src={video.thumbnail} alt={video.title} className="w-10 h-10 object-cover rounded-md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white truncate font-medium">{video.title}</p>
                    <p className="text-[10px] text-white/50 truncate">{video.author.name} • {video.duration.timestamp}</p>
                  </div>
                  {currentVideo?.videoId === video.videoId && <Play className="w-3.5 h-3.5 text-neon-blue mr-1" />}
                </div>
              ))}
            </div>
          )}

          {/* Player */}
          <div className="flex-1 w-full rounded-xl overflow-hidden border border-white/10 bg-black relative group shadow-2xl min-h-[160px]">
            {currentVideo ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1`}
                title="YouTube music player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white/20">
                <Youtube className="w-12 h-12 mb-2 opacity-20" />
                <p className="text-sm">Search for a song to start listening</p>
              </div>
            )}
            
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent opacity-50" />
          </div>
        </div>
      </motion.div>

      <motion.button
        animate={{ rotate: isOpen ? 90 : 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-16 h-16 rounded-full shadow-[0_0_30px_rgba(0,255,255,0.3)] flex items-center justify-center transition-colors duration-500 pointer-events-auto ${
          isOpen 
            ? 'bg-white/10 text-white border border-white/20' 
            : 'bg-gradient-to-br from-[#00f0ff] to-[#0080ff] text-black border border-white/20'
        }`}
      >
        {!isOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-neon-blue blur-xl opacity-40 animate-pulse" />
            <div className="absolute inset-1 rounded-full border border-white/40" />
          </>
        )}
        <div className="relative z-10">
          {isOpen ? <X className="w-6 h-6" /> : <Music className="w-7 h-7" />}
        </div>
      </motion.button>
    </div>
  );
}
