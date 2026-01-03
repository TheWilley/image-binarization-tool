import { useState } from 'react';
import type { Colors, Algorithm } from '../global/types';

export default function useSettings() {
  const [threshold, setThreshold] = useState(128);
  const [algorithm, setAlgorithm] = useState<Algorithm>('otsu');
  const [invert, setInvert] = useState(false);
  const [colors, setColors] = useState<Colors>({
    aboveThresholdColor: '#ffffff',
    belowThresholdColor: '#000000',
  });

  return {
    threshold,
    setThreshold,
    algorithm,
    setAlgorithm,
    invert,
    setInvert,
    colors,
    setColors,
  };
}
