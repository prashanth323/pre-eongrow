import React from 'react';
import { ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />);
Breadcrumb.displayName = 'Breadcrumb';

export const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-xs text-[#818A84]',
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

export const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1.5', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

export const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
    onClick?: (e: React.MouseEvent) => void;
  }
>(({ className, onClick, ...props }, ref) => {
  return (
    <a
      ref={ref}
      onClick={onClick}
      className={cn(
        'transition-colors hover:text-[#171C19] cursor-pointer font-medium',
        className
      )}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

export const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn('font-semibold text-[#171C19] truncate max-w-[200px] sm:max-w-xs md:max-w-md', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

export const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn('[&>svg]:w-3.5 [&>svg]:h-3.5 text-black/30', className)}
    {...props}
  >
    {children ?? <ChevronRight className="w-3.5 h-3.5" />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';
