import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverEffect = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-black/[0.06] rounded-[24px] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_8px_24px_-4px_rgba(7,88,63,0.03)] transition-all duration-200',
          hoverEffect && 'apple-card',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
