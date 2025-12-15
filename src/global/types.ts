export type Setter<T> = React.Dispatch<React.SetStateAction<T>>;

export interface RLEData {
  width: number;
  height: number;
  runs: number[];
}
