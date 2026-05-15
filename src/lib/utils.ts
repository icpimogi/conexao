import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string) {
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Local number without 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    const match = cleaned.length === 11 
      ? cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)
      : cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
  }
  
  // International with 55
  if (cleaned.startsWith('55')) {
    const core = cleaned.slice(2);
    if (core.length === 10 || core.length === 11) {
      const match = core.length === 11 
        ? core.match(/^(\d{2})(\d{5})(\d{4})$/)
        : core.match(/^(\d{2})(\d{4})(\d{4})$/);
      if (match) {
        return `+55 (${match[1]}) ${match[2]}-${match[3]}`;
      }
    }
  }

  return phone;
}

export function normalizePhoneNumber(phone: string) {
  let cleaned = ('' + phone).replace(/\D/g, '');
  if (!cleaned) return '';
  
  // Handle common Brazil prefixes
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('0')) cleaned = cleaned.slice(1);
  
  // If it starts with 55, check if it's already full
  if (cleaned.startsWith('55')) {
    // If it has a zero after 55 (common mistake 55011...), remove it
    if (cleaned.length > 11 && cleaned[2] === '0') {
      cleaned = '55' + cleaned.slice(3);
    }
  } else {
    // Add 55 if it's a local number (10 or 11 digits)
    if (cleaned.length === 10 || cleaned.length === 11) {
      cleaned = '55' + cleaned;
    }
  }
  
  return cleaned;
}
