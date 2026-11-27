import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={generatedId} className="block text-xs font-medium text-[#818A84]">
            {label}
          </label>
        )}
        <input
          id={generatedId}
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-2xl text-sm text-[#171C19] placeholder:text-[#818A84]/70 transition-all duration-150',
            'focus:outline-none focus:bg-white focus:border-black/30 focus:ring-4 focus:ring-black/5 shadow-2xs',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#818A84]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
