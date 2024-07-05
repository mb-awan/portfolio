import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';

/**
 * Combines and merges multiple CSS class names or values using the classix and tailwind-merge libraries.
 * This function takes any number of arguments and passes them to the cx function from classix,
 * which generates a combined class name string. The result is then passed to twMerge from tailwind-merge,
 * which merges any overlapping or duplicate classes into a final single string.
 *
 * @param args - The CSS class names or values to be combined and merged.
 * @returns - A merged string containing the combined CSS class names or values.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Resolves the Tailwind CSS configuration object using the tailwindcss/resolveConfig library.
 *
 * @param config - The Tailwind CSS configuration object to be resolved.
 * @returns - The resolved Tailwind CSS configuration object.
 */
export const fullConfig = resolveConfig(tailwindConfig);
