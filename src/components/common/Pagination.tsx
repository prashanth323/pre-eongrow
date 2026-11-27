import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  itemsPerPage,
  pageSize,
  onPageChange,
  className = '',
}) => {
  const effectivePageSize = itemsPerPage ?? pageSize ?? 10;
  const totalPages = Math.ceil(totalItems / effectivePageSize);

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * effectivePageSize + 1;
  const endItem = Math.min(currentPage * effectivePageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-black/[0.06] ${className}`}>
      <span className="text-xs text-[#818A84]">
        Showing <strong className="text-[#171C19] font-medium">{startItem}-{endItem}</strong> of <strong className="text-[#171C19] font-medium">{totalItems}</strong> items
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-1.5 rounded-xl border border-black/10 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-[#171C19]"
          aria-label="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs text-[#818A84]">
                  …
                </span>
              );
            }

            const isCurrent = page === currentPage;
            return (
              <button
                key={`page-${page}`}
                type="button"
                onClick={() => onPageChange(Number(page))}
                className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white hover:bg-neutral-100 border border-black/10 text-[#525854]'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-1.5 rounded-xl border border-black/10 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer text-[#171C19]"
          aria-label="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
