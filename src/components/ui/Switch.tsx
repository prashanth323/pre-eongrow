import React from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  size?: 'sm' | 'md';
  activeColor?: string;
  className?: string;
  'aria-label'?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  name,
  label,
  description,
  size = 'md',
  activeColor = 'bg-[#171C19]',
  className,
  'aria-label': ariaLabel,
}) => {
  const switchElement = (
    <button
      type="button"
      role="switch"
      id={id}
      name={name}
      aria-checked={checked}
      aria-label={ariaLabel || label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onCheckedChange(!checked);
      }}
      className={cn(
        'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
        size === 'sm' ? 'h-5 w-9 p-0.5' : 'h-6 w-11 p-0.5',
        checked ? activeColor : 'bg-neutral-200 hover:bg-neutral-300',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
          size === 'sm' ? 'h-4 w-4' : 'h-5 w-5',
          checked
            ? size === 'sm'
              ? 'translate-x-4'
              : 'translate-x-5'
            : 'translate-x-0'
        )}
      />
    </button>
  );

  if (!label && !description) {
    return switchElement;
  }

  return (
    <div
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        'flex items-center justify-between gap-4 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <div className="flex flex-col text-left">
        {label && <span className="text-xs font-semibold text-[#171C19]">{label}</span>}
        {description && <span className="text-[11px] text-[#818A84] leading-snug">{description}</span>}
      </div>
      {switchElement}
    </div>
  );
};
