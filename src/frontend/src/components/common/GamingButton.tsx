import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface GamingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const GamingButton = forwardRef<HTMLButtonElement, GamingButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-all duration-200 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
    
    const variantStyles = {
      primary: 'bg-gradient-to-r from-ff-orange to-ff-orange/80 hover:from-ff-orange/90 hover:to-ff-orange/70 text-white shadow-lg shadow-ff-orange/50 hover:shadow-ff-orange/70',
      secondary: 'bg-gradient-to-r from-ff-cyan to-ff-cyan/80 hover:from-ff-cyan/90 hover:to-ff-cyan/70 text-background shadow-lg shadow-ff-cyan/50 hover:shadow-ff-cyan/70',
      danger: 'bg-gradient-to-r from-destructive to-destructive/80 hover:from-destructive/90 hover:to-destructive/70 text-white shadow-lg shadow-destructive/50',
    };

    const sizeStyles = {
      sm: 'px-4 py-2 text-sm min-h-[36px]',
      md: 'px-6 py-3 text-base min-h-[44px]',
      lg: 'px-8 py-4 text-lg min-h-[52px]',
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
