import type { RGB } from '../global/types';

/**
 * Converts a hex color string to an RGB object.
 * @param hex The hex color string (e.g., '#ff5733').
 * @returns An object with r, g, b properties.
 */
export function hexToRgb(hex: string): RGB {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
