import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactPlayer from 'react-player';
import { Plus, X, Youtube, FileText, Tag, Send, UploadCloud, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Subject } from '../types';
import { FuturisticButton } from './FuturisticButton';
import { supabase } from '../lib/supabase';

interface AddClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: { title: string; subject: Subject; youtubeUrl: string; pdfUrl?: string }) => void;
}

const SUBJECTS: Subject[] = [
  'Bangla', 'English', 'ICT', 
  'Higher Math 1st Paper', 'Higher Math 2nd Paper',
  'Physics 1st Paper', 'Physics 2nd Paper',
  'Chemistry 1st Paper', 'Chemistry 2nd Paper',
  'Biology 1st Paper', 'Biology 2nd Paper'
];

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('ICT');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  const extractYoutubeId = (url: string) => {
    if (!url) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\/shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    return null;
  };

  const handleYoutubeUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setYoutubeUrl(url);

    const videoId = extractYoutubeId(url);
    if (videoId) {
      setIsFetchingTitle(true);
      try {
        const response = await fetch(`https://noembed.com/embed?dataType=json&url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        if (data && data.title) {
          setTitle(data.title);
        }
      } catch (error) {
        console.error('Failed to fetch YouTube title:', error);
      } finally {
        setIsFetchingTitle(false);
      }
    }
  };
  
  // File upload state
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTitle('');
      setSubject('ICT');
      setYoutubeUrl('');
      setIsFetchingTitle(false);
      setPdfUrl('');
      setUploadMode('url');
      setFile(null);
      setUploadError('');
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const uploadFileToSupabase = async (fileToUpload: File): Promise<string | null> => {
    try {
      setIsUploading(true);
      setUploadError('');
      
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `study-materials/${fileName}`;

      // Upload to 'study-materials' bucket
      const { data, error } = await supabase.storage
        .from('study-materials')
        .upload(filePath, fileToUpload);

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('study-materials')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      const msg = error.message || 'Failed to upload file. Make sure you created a public bucket named "study-materials" in Supabase.';
      setUploadError(msg);
      alert(msg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { title, youtubeUrl, uploadMode, file });
    if (!title || !youtubeUrl) {
      console.warn('Missing required fields');
      return;
    }
    
    let finalPdfUrl = pdfUrl;

    if (uploadMode === 'file' && file) {
      console.log('Uploading file...');
      const uploadedUrl = await uploadFileToSupabase(file);
      if (!uploadedUrl) {
        console.error('File upload failed');
        return; // Stop if upload failed
      }
      finalPdfUrl = uploadedUrl;
    }

    console.log('Calling onAdd with:', { title, subject, youtubeUrl, pdfUrl: finalPdfUrl });
    onAdd({ title, subject, youtubeUrl, pdfUrl: finalPdfUrl || undefined });
    
    // Reset state
    setTitle('');
    setYoutubeUrl('');
    setIsFetchingTitle(false);
    setPdfUrl('');
    setFile(null);
    setUploadMode('url');
    setUploadError('');
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
                <h2 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Add New Class</h2>
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
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20 bg-white/5 absolute top-0 left-0 text-xs">
                        Invalid YouTube URL or ID
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">PDF Notes (Optional)</label>
                  <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-300 ${
                        uploadMode === 'url' ? 'bg-neon-blue text-brand-black shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline-block mr-1.5" /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all duration-300 ${
                        uploadMode === 'file' ? 'bg-neon-blue text-brand-black shadow-[0_0_10px_rgba(0,242,255,0.3)]' : 'text-white/40 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3 inline-block mr-1" /> Upload
                    </button>
                  </div>
                </div>

                {uploadMode === 'url' ? (
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-neon-blue transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-neon-blue/50 focus:bg-neon-blue/5 focus:ring-1 focus:ring-neon-blue/50 transition-all text-white placeholder:text-white/20 font-medium"
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-full bg-white/5 border border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group ${
                        file ? 'border-neon-blue/50 bg-neon-blue/5 shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]' : 'border-white/20 hover:border-neon-blue/50 hover:bg-white/10 hover:shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]'
                      }`}
                    >
                      {file ? (
                        <>
                          <div className="w-12 h-12 rounded-full bg-neon-blue/10 flex items-center justify-center mb-3">
                            <FileText className="w-6 h-6 text-neon-blue" />
                          </div>
                          <p className="text-sm font-bold text-white truncate max-w-[200px]">{file.name}</p>
                          <p className="text-[10px] font-bold text-neon-blue uppercase tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-neon-blue/10 flex items-center justify-center mb-3 transition-colors duration-300">
                            <UploadCloud className="w-6 h-6 text-white/40 group-hover:text-neon-blue transition-colors duration-300" />
                          </div>
                          <p className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">Click to upload study material</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-2">PDF, DOC, PPT, or Images up to 50MB</p>
                        </>
                      )}
                    </div>
                    {uploadError && (
                      <p className="text-xs text-red-400 mt-2 flex items-start gap-1 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                        <X className="w-3 h-3 shrink-0 mt-0.5" />
                        <span className="font-medium">{uploadError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <FuturisticButton
                type="submit"
                disabled={isUploading}
                className="w-full py-4 mt-4 text-sm"
                showAnimatedBorder
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                )}
                {isUploading ? 'Uploading & Adding...' : 'Add to Dashboard'}
              </FuturisticButton>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
