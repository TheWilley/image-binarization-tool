export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export interface RLEData {
  width: number;
  height: number;
  runs: number[]; // Array representing run lengths
}

export type GridState = (0 | 1)[]; // Represents binary grid state
