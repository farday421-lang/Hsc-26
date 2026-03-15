import { cn } from './utils';

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

const playSound = (frequency: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
  if (!audioCtx) return;
  
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playHoverSound = () => playSound(440, 'sine', 0.05);
export const playClickSound = () => playSound(880, 'sine', 0.1);
export const playSlideSound = () => {
  if (!audioCtx) return;
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 0.1);
};
export const playSuccessSound = () => {
  playSound(523.25, 'sine', 0.1);
  setTimeout(() => playSound(659.25, 'sine', 0.1), 100);
  setTimeout(() => playSound(783.99, 'sine', 0.2), 200);
};
