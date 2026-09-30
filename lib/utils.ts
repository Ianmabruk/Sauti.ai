import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges conditional class names and resolves Tailwind conflicts.
 *
 * `clsx` flattens arrays, objects and falsy values into a single class
 * string; `twMerge` then drops earlier classes that a later one overrides,
 * so a caller-supplied `bg-white` reliably beats a component's default
 * `bg-sauti-surface` regardless of the order the strings were built in.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}