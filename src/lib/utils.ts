import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string) {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{1})(\d{4})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]} ${match[3]}-${match[4]}`;
  }
  return phone;
}
