export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export interface RLEData {
  startColor: 0 | 1; // 0 for black, 1 for white
  width: number;
  height: number;
  runs: number[]; // Array representing run lengths
}

export type GridState = (0 | 1)[]; // Represents binary grid state
