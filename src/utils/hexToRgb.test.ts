import { describe, it, expect } from 'vitest';
import { hexToRgb } from './hexToRgb';

describe('hexToRgb', () => {
  it('should convert a valid hex color to RGB', () => {
    expect(hexToRgb('#ff5733')).toEqual({ r: 255, g: 87, b: 51 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
  });
});
