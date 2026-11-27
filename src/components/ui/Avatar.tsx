import { CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
  className?: string;
}

export function Avatar({
  src,
  name,
  size = 'md',
  isVerified = false,
  className,
}: AvatarProps) {
  const getInitials = (n?: string | null) => {
    if (!n) return 'NG';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const sizes = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-medium',
    lg: 'w-12 h-12 text-base font-semibold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      {src ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={cn('rounded-full object-cover border border-[#E8ECE9]', sizes[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-black/[0.05] text-[#171C19] flex items-center justify-center border border-black/[0.08]',
            sizes[size]
          )}
        >
          {getInitials(name)}
        </div>
      )}

      {isVerified && (
        <CheckCircle2
          className={cn(
            'absolute -bottom-0.5 -right-0.5 text-black bg-white rounded-full',
            iconSizes[size]
          )}
        />
      )}
    </div>
  );
}
