import type { algorithms } from '../data/algorithms';

export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export interface RLEData {
  width: number;
  height: number;
  runs: number[];
}

export type Algorithm = (typeof algorithms)[number];
