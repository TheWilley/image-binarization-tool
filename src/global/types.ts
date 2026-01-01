import type { algorithms } from '../data/algorithms';

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export interface RLEData {
  colors: Colors;
  width: number;
  height: number;
  runs: number[];
}

export type Colors = {
  aboveThresholdColor: Hex;
  belowThresholdColor: Hex;
};

export type Hex = `#${string}`;

export type RGB = {
  r: number;
  g: number;
  b: number;
};

export type Algorithm = (typeof algorithms)[number];
