import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (amount === 0) return 'Free';

  const cleanCurrency = (currency || 'INR').trim();

  // Handle equity / percentage compensation cleanly
  if (cleanCurrency.includes('%') || cleanCurrency.toLowerCase().includes('equity')) {
    return `${amount}% Equity`;
  }

  // Attempt standard ISO currency format (INR, USD, EUR, etc.)
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: cleanCurrency.toUpperCase(),
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Resilient fallback if currency string is not an ISO 4217 code
    return `${cleanCurrency} ${amount.toLocaleString('en-IN')}`;
  }
}

export function formatCompensation(min?: number, max?: number, currency: string = 'INR'): string {
  if (!min && !max) return 'Competitive';

  const cleanCurrency = (currency || 'INR').trim();
  const isEquity = cleanCurrency.includes('%') || cleanCurrency.toLowerCase().includes('equity');

  if (isEquity) {
    if (min && max) return `${min}% – ${max}% Equity`;
    if (min) return `${min}% Equity`;
    return `${max}% Equity`;
  }

  if (min && max) return `${formatCurrency(min, cleanCurrency)} – ${formatCurrency(max, cleanCurrency)}`;
  if (min) return `${formatCurrency(min, cleanCurrency)}+`;
  return formatCurrency(max || 0, cleanCurrency);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
