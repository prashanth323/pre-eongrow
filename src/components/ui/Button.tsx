import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    // Apple Design: Instant feedback on press with velocity-aware spring response
    const baseStyles = 'inline-flex items-center justify-center font-medium select-none cursor-pointer apple-press focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[#171C19] hover:bg-black text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.18)] border-t border-white/20',
      secondary: 'bg-black/[0.05] text-[#171C19] hover:bg-black/[0.08] border border-black/[0.06]',
      outline: 'border border-black/[0.1] bg-white text-[#171C19] hover:bg-black/[0.02] hover:border-black/[0.2] shadow-xs',
      ghost: 'text-[#171C19] hover:bg-black/[0.05]',
      dark: 'bg-black hover:bg-neutral-900 text-white shadow-[0_1px_2px_rgba(0,0,0,0.16),0_4px_16px_rgba(0,0,0,0.28)] border-t border-white/20',
      danger: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
    };

    const sizes = {
      sm: 'text-xs px-3.5 py-1.5 rounded-full gap-1.5 font-semibold',
      md: 'text-xs md:text-sm px-4.5 py-2 rounded-full gap-2 font-semibold',
      lg: 'text-sm md:text-base px-6 py-2.5 rounded-full gap-2.5 font-bold',
      icon: 'p-2 rounded-full h-10 w-10 flex items-center justify-center',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
