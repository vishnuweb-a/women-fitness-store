import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge conditional class names, resolving conflicting Tailwind utilities. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian Rupees, matching the reference screens. */
export function formatPrice(amount, currency = 'INR') {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}
