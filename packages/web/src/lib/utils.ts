// Supported currencies with flag URLs
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', flag: 'https://flagcdn.com/us.svg' },
  { code: 'EUR', flag: 'https://flagcdn.com/eu.svg' },
  { code: 'GBP', flag: 'https://flagcdn.com/gb.svg' },
  { code: 'NGN', flag: 'https://flagcdn.com/ng.svg' },
];

export const getFlag = (code: string) => SUPPORTED_CURRENCIES.find(c => c.code === code)?.flag;
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}