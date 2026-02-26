import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface GamingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const GamingButton = forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'font-bold rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-gaming tracking-wide uppercase';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-ff-orange via-ff-orange to-ff-red hover:from-ff-orange/90 hover:via-ff-orange hover:to-ff-red/90 text-white shadow-ff-orange hover:shadow-ff-glow border-2 border-ff-orange/50',
      secondary: 'bg-gradient-to-r from-ff-cyan via-ff-cyan to-secondary hover:from-ff-cyan/90 hover:via-ff-cyan hover:to-secondary/90 text-background shadow-ff-cyan hover:shadow-lg border-2 border-ff-cyan/50',
      danger: 'bg-gradient-to-r from-ff-red via-destructive to-ff-red/80 hover:from-ff-red/90 hover:via-destructive/90 hover:to-ff-red/70 text-white shadow-lg shadow-destructive/50 border-2 border-ff-red/50',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-xs min-h-[36px]',
      md: 'px-6 py-3 text-sm min-h-[44px]',
      lg: 'px-8 py-4 text-base min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GamingButton.displayName = 'GamingButton';

export default GamingButton;
