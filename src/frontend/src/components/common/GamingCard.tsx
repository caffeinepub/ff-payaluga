import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GamingCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'orange' | 'cyan' | 'none';
}

export default function GamingCard({ children, className, glowColor = 'orange' }: GamingCardProps) {
  const glowStyles = {
    orange: 'border-ff-orange/40 hover:border-ff-orange/60 hover:shadow-ff-orange bg-gradient-to-br from-card/90 to-card/70',
    cyan: 'border-ff-cyan/40 hover:border-ff-cyan/60 hover:shadow-ff-cyan bg-gradient-to-br from-card/90 to-card/70',
    none: 'border-border/50 bg-card/80',
  };

  return (
    <div
      className={cn(
        'backdrop-blur-md rounded-xl border-2 p-6 transition-all duration-300 relative overflow-hidden',
        glowStyles[glowColor],
        className
      )}
    >
      {/* Battle-themed corner accent */}
      {glowColor !== 'none' && (
        <>
          <div className={cn(
            'absolute top-0 right-0 w-20 h-20 opacity-20',
            glowColor === 'orange' ? 'bg-ff-orange' : 'bg-ff-cyan'
          )} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
          <div className={cn(
            'absolute bottom-0 left-0 w-20 h-20 opacity-20',
            glowColor === 'orange' ? 'bg-ff-orange' : 'bg-ff-cyan'
          )} style={{ clipPath: 'polygon(0 100%, 0 0, 100% 100%)' }}></div>
        </>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
