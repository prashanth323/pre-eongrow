import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ArrowRevealButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  text?: string;
  variant?: 'light' | 'dark';
}

export const ArrowRevealButton = React.forwardRef<
  HTMLButtonElement,
  ArrowRevealButtonProps
>(({ className, children, text, variant = 'light', ...props }, ref) => {
  const content = children || text || 'Create Free Account';

  const variantStyles = {
    light:
      'bg-white text-black hover:bg-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.1),0_10px_25px_-5px_rgba(0,0,0,0.2)] border border-white/60 hover:shadow-2xl',
    dark:
      'bg-[#171C19] text-white hover:bg-black shadow-[0_1px_3px_rgba(0,0,0,0.3),0_10px_25px_-5px_rgba(0,0,0,0.4)] border border-white/15 hover:shadow-2xl',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold text-sm h-12 px-8 select-none cursor-pointer apple-press transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <span className="inline-flex items-center transition-transform duration-300 ease-out group-hover:-translate-x-2.5">
        {content}
      </span>
      <span className="absolute right-6 flex items-center justify-center opacity-0 translate-x-3 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </span>
    </button>
  );
});

ArrowRevealButton.displayName = 'ArrowRevealButton';
