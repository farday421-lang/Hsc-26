import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  'Chemistry 1st Paper', 'Chemistry 2nd Paper'
];

export const AddClassModal: React.FC<AddClassModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<Subject>('ICT');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  
  // File upload state
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            className="glass-card w-full max-w-lg p-8 relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-neon-blue to-neon-purple" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Add New Class</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-6 h-6 text-white/40" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Class Title</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Integration Basic Part 1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-neon-blue/50 transition-all text-white placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value as Subject)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-neon-blue/50 transition-all text-white appearance-none cursor-pointer"
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s} className="bg-brand-grey">{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest ml-1">YouTube Link</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                    <Youtube className="w-4 h-4" />
                  </div>
                  <input
                    required
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-neon-blue/50 transition-all text-white placeholder:text-white/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">PDF Notes (Optional)</label>
                  <div className="flex bg-white/5 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                        uploadMode === 'url' ? 'bg-neon-blue text-black' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3 inline-block mr-1" /> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors ${
                        uploadMode === 'file' ? 'bg-neon-blue text-black' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      <UploadCloud className="w-3 h-3 inline-block mr-1" /> Upload
                    </button>
                  </div>
                </div>

                {uploadMode === 'url' ? (
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-neon-blue/50 transition-all text-white placeholder:text-white/20"
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
                      className={`w-full bg-white/5 border border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        file ? 'border-neon-blue/50 bg-neon-blue/5' : 'border-white/20 hover:border-neon-blue/50 hover:bg-white/10'
                      }`}
                    >
                      {file ? (
                        <>
                          <FileText className="w-6 h-6 text-neon-blue mb-2" />
                          <p className="text-sm font-medium text-white truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-white/40 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-white/40 mb-2" />
                          <p className="text-sm text-white/60">Click to upload study material</p>
                          <p className="text-xs text-white/30 mt-1">PDF, DOC, PPT, or Images up to 50MB</p>
                        </>
                      )}
                    </div>
                    {uploadError && (
                      <p className="text-xs text-red-400 mt-2 flex items-start gap-1">
                        <X className="w-3 h-3 shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              <FuturisticButton
                type="submit"
                disabled={isUploading}
                className="w-full py-4"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
