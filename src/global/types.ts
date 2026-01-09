import type { algorithms } from '../data/algorithms';

/**
 * A setter function type for React state management.
 */
export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

/**
 * Run-Length Encoded (RLE) data structure for image representation.
 */
export interface RLEData {
  colors: Colors;
  width: number;
  height: number;
  runs: number[];
}

/**
 * Colors used in the RLE image data.
 */
export type Colors = {
  aboveThresholdColor: Hex;
  belowThresholdColor: Hex;
};

/**
 * Hex color string type, prefixed with '#'.
 */
export type Hex = `#${string}`;

/**
 * RGB color representation.
 */
export type RGB = {
  r: number;
  g: number;
  b: number;
};

/**
 * Algorithm type derived from the algorithms array.
 */
export type Algorithm = (typeof algorithms)[number];
