import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Composes and merges CSS class names, resolving Tailwind conflicts and duplicates.
 *
 * @param inputs - Class name inputs (strings, arrays, objects) accepted by `clsx`
 * @returns The resulting merged class string with Tailwind utilities deduplicated and conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}