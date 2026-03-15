import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { playHoverSound, playClickSound } from '../lib/sounds';

interface FuturisticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  showAnimatedBorder?: boolean;
  className?: string;
}

export const FuturisticButton: React.FC<FuturisticButtonProps> = ({ 
  children, 
  variant = 'primary', 
  showAnimatedBorder = false,
  className,
  onClick,
  onMouseEnter,
  ...props 
}) => {
  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    playHoverSound();
    onMouseEnter?.(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playClickSound();
    onClick?.(e);
  };

  const baseStyles = "relative px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden group";
  
  const variants = {
    primary: "bg-neon-blue text-brand-black shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    outline: "bg-transparent text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/10",
    ghost: "bg-transparent text-white/40 hover:text-white hover:bg-white/5"
  };

  const buttonContent = (
    <button
      className={cn(baseStyles, variants[variant], className)}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      {...props}
    >
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
      <span className="relative z-10">{children}</span>
    </button>
  );

  if (showAnimatedBorder) {
    return (
      <div className={cn("animated-border-container", className)}>
        <div className="animated-border-content">
          <button
            className={cn(baseStyles, "bg-brand-black border-none w-full h-full hover:bg-white/5", className)}
            onMouseEnter={handleMouseEnter}
            onClick={handleClick}
            {...props}
          >
            <span className="relative z-10">{children}</span>
          </button>
        </div>
      </div>
    );
  }

  return buttonContent;
};
