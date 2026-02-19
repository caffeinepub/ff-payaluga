import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface GamingCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'orange' | 'cyan' | 'none';
}

export default function GamingCard({ children, className, glowColor = 'orange' }: GamingCardProps) {
  const glowStyles = {
    orange: 'border-ff-orange/30 hover:border-ff-orange/50 hover:shadow-lg hover:shadow-ff-orange/20',
    cyan: 'border-ff-cyan/30 hover:border-ff-cyan/50 hover:shadow-lg hover:shadow-ff-cyan/20',
    none: 'border-border/50',
  };

  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-sm rounded-lg border-2 p-6 transition-all duration-300',
        glowStyles[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}
