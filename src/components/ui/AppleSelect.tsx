import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AppleSelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface AppleSelectProps {
  options: AppleSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  direction?: 'up' | 'down' | 'auto';
  disabled?: boolean;
}

/**
 * Apple Design System Cupertino Select / Menu Component
 * Implements macOS / iOS Human Interface Guidelines:
 * - Frosted glass translucent container with hairline border & heavy drop shadow
 * - Subtle spring feedback on press
 * - Checkmark indicator on active item
 * - Keyboard navigation (Esc to close) and click-outside dismissal
 * - Smart Drop-Up / Drop-Down positioning to prevent viewport underflow
 */
export const AppleSelect: React.FC<AppleSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select option...',
  className,
  buttonClassName,
  menuClassName,
  align = 'left',
  direction = 'auto',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoDirection, setAutoDirection] = useState<'up' | 'down'>('down');

  const selectedOption = options.find((opt) => opt.value === value);
  const resolvedDirection = direction === 'up' || direction === 'down' ? direction : autoDirection;

  useEffect(() => {
    // Auto-detect based on remaining viewport space when auto mode is active
    if (direction === 'auto' && isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 300 && spaceAbove > spaceBelow) {
        setAutoDirection('up');
      } else {
        setAutoDirection('down');
      }
    }
  }, [isOpen, direction]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl bg-black/[0.03] border border-black/[0.08] hover:bg-black/[0.06] hover:border-black/[0.16] text-xs font-semibold text-[#171C19] transition-all select-none apple-press cursor-pointer',
          isOpen && 'ring-2 ring-black/10 border-black/20 bg-white shadow-xs',
          disabled && 'opacity-50 cursor-not-allowed',
          buttonClassName
        )}
      >
        <span className="truncate flex items-center gap-2">
          {selectedOption?.icon}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-[#818A84] flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 text-black'
          )}
        />
      </button>

      {/* Apple Glass Dropdown Popover (Supports Drop-Up & Drop-Down) */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 min-w-[200px] max-w-xs max-h-72 overflow-y-auto p-1.5 rounded-2xl bg-white/95 backdrop-blur-2xl border border-black/[0.08] animate-in fade-in zoom-in-95 duration-150 scrollbar-none',
            resolvedDirection === 'up'
              ? 'bottom-full mb-2 origin-bottom shadow-[0_-16px_36px_-6px_rgba(0,0,0,0.16),0_-4px_12px_rgba(0,0,0,0.06)]'
              : 'top-full mt-2 origin-top shadow-[0_16px_36px_-6px_rgba(0,0,0,0.16),0_4px_12px_rgba(0,0,0,0.06)]',
            align === 'right' ? 'right-0' : 'left-0',
            menuClassName
          )}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer apple-press group',
                  isSelected
                    ? 'bg-black/[0.06] text-black font-semibold'
                    : 'text-[#171C19] hover:bg-black/[0.04]'
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.icon && <span className="flex-shrink-0">{opt.icon}</span>}
                  <div className="truncate">
                    <p className="truncate leading-tight">{opt.label}</p>
                    {opt.description && (
                      <p className="text-[10px] text-[#818A84] font-normal truncate mt-0.5">
                        {opt.description}
                      </p>
                    )}
                  </div>
                </div>

                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-black flex-shrink-0" />
                ) : (
                  <span className="w-3.5 h-3.5 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
