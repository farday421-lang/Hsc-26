import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sigma } from 'lucide-react';
import { FuturisticButton } from './FuturisticButton';
import { Subject } from '../types';
import { getFormulasForSubject } from '../lib/formulas';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  title: string;
}

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose, subject, title }) => {
  if (!isOpen) return null;

  const formulas = getFormulasForSubject(subject);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl max-h-[85vh] overflow-hidden glass-card rounded-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-neon-blue/20 rounded-lg">
                <Sigma className="w-6 h-6 text-neon-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Sutro & Math</h2>
                <p className="text-sm text-white/60">{title} - {subject}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
            {formulas.length > 0 ? (
              formulas.map((chapter, idx) => (
                <div key={idx} className="space-y-4">
                  <h3 className="text-lg font-bold text-neon-blue border-b border-neon-blue/20 pb-2">
                    {chapter.chapter}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {chapter.formulas.map((formula, fIdx) => (
                      <div key={fIdx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
                        <div className="text-sm font-medium text-white/80 mb-3">{formula.name}</div>
                        <div className="text-center overflow-x-auto py-2">
                          <BlockMath math={formula.math} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-white/40">
                No formulas found for this subject.
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
            <FuturisticButton onClick={onClose} className="px-6">
              Close
            </FuturisticButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
