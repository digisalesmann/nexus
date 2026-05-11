// Supported currencies with flag URLs
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', flag: 'https://flagcdn.com/us.svg' },
  { code: 'EUR', flag: 'https://flagcdn.com/eu.svg' },
  { code: 'GBP', flag: 'https://flagcdn.com/gb.svg' },
  { code: 'NGN', flag: 'https://flagcdn.com/ng.svg' },
  { code: 'CAD', flag: 'https://flagcdn.com/ca.svg' },
  { code: 'JPY', flag: 'https://flagcdn.com/jp.svg' },
  { code: 'CHF', flag: 'https://flagcdn.com/ch.svg' },
  { code: 'AUD', flag: 'https://flagcdn.com/au.svg' },
  { code: 'AED', flag: 'https://flagcdn.com/ae.svg' },
  { code: 'CNY', flag: 'https://flagcdn.com/cn.svg' },
];

export const getFlag = (code: string) => SUPPORTED_CURRENCIES.find(c => c.code === code)?.flag;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', NGN: '₦',
  CAD: 'CA$', JPY: '¥', CHF: 'Fr', AUD: 'A$', AED: 'د.إ', CNY: '¥',
};

export const getCurrencySymbol = (code: string) => CURRENCY_SYMBOLS[code] ?? code;
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}