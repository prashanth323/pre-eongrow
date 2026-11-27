import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'neutral' | 'brand' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-black/[0.04] text-[#171C19] border-black/[0.06]',
    success: 'bg-black/[0.04] text-[#171C19] border-black/[0.08]',
    warning: 'bg-amber-500/10 text-amber-900 border-amber-500/20',
    neutral: 'bg-black/[0.03] text-neutral-600 border-black/[0.06]',
    brand: 'bg-[#171C19] text-white border-transparent shadow-xs',
    outline: 'bg-transparent text-[#171C19] border-black/[0.08]',
  };

  const sizes = {
    sm: 'text-[10px] px-2.5 py-0.5 rounded-full font-semibold tracking-wide',
    md: 'text-xs px-3 py-1 rounded-full font-semibold tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border transition-all select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
