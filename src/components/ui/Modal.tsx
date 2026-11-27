import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
  noPadding?: boolean;
  hideHeader?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  className,
  noPadding = false,
  hideHeader = false,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Apple Dimming Scrim with Translucent Blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Apple Dialog Window */}
      <div
        className={cn(
          'relative w-full bg-white rounded-[28px] shadow-2xl border border-black/[0.08] z-10 transition-all transform animate-in zoom-in-95 duration-200',
          !noPadding && 'p-6 sm:p-8',
          maxWidths[maxWidth],
          className
        )}
      >
        {!hideHeader && (
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && <h3 className="text-lg sm:text-xl font-light text-[#171C19] tracking-tight">{title}</h3>}
              {description && <p className="text-xs sm:text-sm text-[#818A84] mt-1 leading-relaxed">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/[0.05] hover:bg-black/[0.1] text-neutral-600 flex items-center justify-center apple-press cursor-pointer flex-shrink-0 transition-colors ml-4"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className={cn(!hideHeader && 'mt-2')}>{children}</div>
      </div>
    </div>
  );
}
