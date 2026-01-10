import type { Hex } from '../global/types';

/**
 * Adds or removes the '#' prefix from a hex color string.
 * @param value The hex color string, with or without the '#' prefix.
 * @param operation The operation to perform: 'add' to add the prefix, 'remove' to remove it.
 * @returns The hex color string with the prefix added or removed.
 */
export function prefixHex(value: string, operation: 'add' | 'remove'): Hex {
  if (operation === 'add') {
    return `#${value}`;
  } else {
    return value.replace(/^#/, '') as Hex;
  }
}
