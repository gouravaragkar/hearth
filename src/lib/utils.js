import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatAUD(amount) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
}

// Re-export formatCurrency for convenience
export { formatCurrency } from '@/lib/currencies';

export const CATEGORY_COLORS = {
  Housing:       '#E8724A',
  Utilities:     '#7BAE7F',
  Insurance:     '#D4A853',
  Subscriptions: '#A78BCA',
  Groceries:     '#5BA4CF',
  Transport:     '#F4A261',
  Health:        '#E76F8A',
  Entertainment: '#48CAE4',
  Education:     '#90BE6D',
  Other:         '#ADB5BD',
};

export const CATEGORY_ICONS = {
  Housing:       '🏠',
  Utilities:     '💡',
  Insurance:     '🛡️',
  Subscriptions: '📱',
  Groceries:     '🛒',
  Transport:     '🚗',
  Health:        '❤️',
  Entertainment: '🎬',
  Education:     '📚',
  Other:         '📦',
};

export const CATEGORIES = [
  'Housing','Utilities','Insurance','Subscriptions',
  'Groceries','Transport','Health','Entertainment','Education','Other'
];

export function getNextDueDate(startDate, frequency) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let next = new Date(startDate);

  while (next < today) {
    if (frequency === 'weekly') next.setDate(next.getDate() + 7);
    else if (frequency === 'fortnightly') next.setDate(next.getDate() + 14);
    else if (frequency === 'quarterly') next.setMonth(next.getMonth() + 3);
    else if (frequency === 'semi-annual') next.setMonth(next.getMonth() + 6);
    else if (frequency === 'annual') next.setMonth(next.getMonth() + 12);
    else next.setMonth(next.getMonth() + 1);
  }
  return next;
}

export function getMonthlyEquivalent(amount, frequency) {
  if (frequency === 'weekly') return amount * 52 / 12;
  if (frequency === 'fortnightly') return amount * 26 / 12;
  if (frequency === 'quarterly') return amount / 3;
  if (frequency === 'semi-annual') return amount / 6;
  if (frequency === 'annual') return amount / 12;
  return amount;
}