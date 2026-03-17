import React, { useState, useEffect } from 'react';
import { X, Youtube, FileText, Loader2, Tag, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { Subject, ClassItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const SUBJECTS: Subject[] = ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'Bangla', 'English', 'ICT'];

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { title: string; subject: Subject; youtubeUrl: string; pdfUrl?: string }) => void;
  editingClass?: ClassItem;
}

export function AddClassModal({ isOpen, onClose, onAdd, editingClass }: AddClassModalProps) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('Physics');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);

  useEffect(() => {
    if (isOpen && editingClass) {
      setTitle(editingClass.title);
      setSubject(editingClass.subject);
      setYoutubeUrl(editingClass.youtubeUrl);
      setPdfUrl(editingClass.pdfUrl || '');
    } else if (isOpen) {
      setTitle('');
      setSubject('Physics');
      setYoutubeUrl('');
      setPdfUrl('');
    }
  }, [isOpen, editingClass]);

  const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleYoutubeUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);
    
    if (url && !title) {
      const videoId = extractYoutubeId(url);
      if (videoId) {
        setIsFetchingTitle(true);
        try {
          const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
          const data = await response.json();
          if (data.title) {
            setTitle(data.title);
          }
        } catch (error) {
          console.error('Failed to fetch video title:', error);
        } finally {
          setIsFetchingTitle(false);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !youtubeUrl) return;
    
    onAdd({ title, subject, youtubeUrl, pdfUrl: pdfUrl || undefined });
    
    setTitle('');
    setYoutubeUrl('');
    setIsFetchingTitle(false);
    setPdfUrl('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass-card w-full max-w-lg p-8 relative z-10 overflow-hidden bg-gradient-to-br from-brand-black/90 to-brand-grey/90 border border-white/10 shadow-[0_0_50px_rgba(0,242,255,0.1)]"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-[length:200%_100%] animate-gradient" />
            
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h2>
                <p className="text-xs text-white/40 font-medium tracking-wide">Expand your learning journey</p>
              </div>
              <button type="button" onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all duration-300 group">
                <X className="w-5 h-5 text-white/40 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-white/40 group-focus-within:text-neon-blue uppercase tracking-widest ml-1 transition-colors">Class Title</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-blue transition-colors">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Integration Basic Part 1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 focus:ring-1 focus:ring-neon-blue/50 transition-all text-white placeholder:text-white/20 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-white/40 group-focus-within:text-neon-blue uppercase tracking-widest ml-1 transition-colors">Subject</label>
                <div className="relative">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value as Subject)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 focus:ring-1 focus:ring-neon-blue/50 transition-all text-white appearance-none cursor-pointer font-medium"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s} className="bg-brand-grey">{s}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-focus-within:text-neon-blue transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-white/40 group-focus-within:text-neon-blue uppercase tracking-widest ml-1 transition-colors">YouTube Link</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-red-500 transition-colors">
                    {isFetchingTitle ? (
                      <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                    ) : (
                      <Youtube className="w-4 h-4" />
                    )}
                  </div>
                  <input
                    required
                    type="url"
                    value={youtubeUrl}
                    onChange={handleYoutubeUrlChange}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-red-500/50 focus:bg-red-500/5 focus:ring-1 focus:ring-red-500/50 transition-all text-white placeholder:text-white/20 font-medium"
                  />
                </div>
                {youtubeUrl && (
                  <div className="mt-3 aspect-video w-full rounded-xl overflow-hidden bg-brand-black border border-white/10 relative">
                    {extractYoutubeId(youtubeUrl) ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${extractYoutubeId(youtubeUrl)}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full absolute top-0 left-0"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/20 font-medium text-sm">
                        Invalid YouTube URL
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 group">
                <label className="text-[10px] font-bold text-white/40 group-focus-within:text-neon-blue uppercase tracking-widest ml-1 transition-colors">PDF Link (Optional)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-purple transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 focus:ring-1 focus:ring-neon-purple/50 transition-all text-white placeholder:text-white/20 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/90 hover:to-neon-purple/90 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 tracking-wide uppercase text-sm mt-8"
              >
                {editingClass ? 'Save Changes' : 'Add Class'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
