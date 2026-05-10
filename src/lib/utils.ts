import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    currencyDisplay: 'symbol',
  }).format(amount);
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('ar-SA').format(num);
}
