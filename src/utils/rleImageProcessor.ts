import type { RLEData } from '../global/types';

export default class RLEImageProcessor {
  private rgbaToBinary(rgbaArray: number[]): number[] {
    const binaryArray = [];

    for (let i = 0; i < rgbaArray.length; i += 4) {
      const r = rgbaArray[i];
      const g = rgbaArray[i + 1];
      const b = rgbaArray[i + 2];

      if (r === 0 && g === 0 && b === 0) {
        binaryArray.push(0);
      } else if (r === 255 && g === 255 && b === 255) {
        binaryArray.push(1);
      } else {
        binaryArray.push(0.5);
      }
    }

    return binaryArray;
  }

  private binaryToRgba(binaryArray: number[]): Uint8ClampedArray {
    const rgbaArray = new Uint8ClampedArray(binaryArray.length * 4);

    for (let i = 0; i < binaryArray.length; i++) {
      const value = binaryArray[i];
      const pixelIndex = i * 4;

      if (value === 0) {
        rgbaArray[pixelIndex] = 0;
        rgbaArray[pixelIndex + 1] = 0;
        rgbaArray[pixelIndex + 2] = 0;
      } else {
        rgbaArray[pixelIndex] = 255;
        rgbaArray[pixelIndex + 1] = 255;
        rgbaArray[pixelIndex + 2] = 255;
      }

      rgbaArray[pixelIndex + 3] = 255;
    }

    return rgbaArray;
  }

  private encodeRunLength(binaryArray: number[]): number[] {
    if (binaryArray.length === 0) {
      return [];
    }

    const encoded: number[] = [];
    const startValue = binaryArray[0];
    encoded.push(startValue);

    let count = 1;
    let previous = binaryArray[0];

    for (let i = 1; i < binaryArray.length; i++) {
      if (binaryArray[i] !== previous) {
        encoded.push(count);
        count = 1;
        previous = binaryArray[i];
      } else {
        count++;
      }
    }

    encoded.push(count);
    return encoded;
  }

  private decodeRunLength(encoded: number[]): number[] {
    if (encoded.length === 0) {
      return [];
    }

    const binaryArray: number[] = [];
    let currentValue = encoded[0];

    for (let i = 1; i < encoded.length; i++) {
      const runLength = encoded[i];
      binaryArray.push(...Array(runLength).fill(currentValue));
      currentValue = 1 - currentValue;
    }

    return binaryArray;
  }

  private stringifyRunLength(data: RLEData): string {
    return `${data.width}|${data.height}|${data.runs.join(',')}`;
  }

  private parseRunLengthString(str: string): RLEData | null {
    try {
      const parts = str.split('|');
      if (parts.length < 3) return null;

      const width = parseInt(parts[0], 10);
      const height = parseInt(parts[1], 10);
      const runsStr = parts[2];

      if (isNaN(width) || isNaN(height)) {
        return null;
      }

      const runs =
        runsStr.trim() === '' ? [] : runsStr.split(',').map((n) => parseInt(n, 10));

      if (runs.some(isNaN)) return null;

      return {
        width,
        height,
        runs,
      };
    } catch {
      return null;
    }
  }

  public processImageData(rgbaData: number[], width: number, height: number): string {
    const binaryArray = this.rgbaToBinary(rgbaData);
    const rleData: RLEData = {
      width,
      height,
      runs: this.encodeRunLength(binaryArray),
    };
    return this.stringifyRunLength(rleData);
  }

  public decodeImageData(data: string): {
    width: number;
    height: number;
    rgbaData: Uint8ClampedArray;
  } {
    const rleData = this.parseRunLengthString(data);
    if (!rleData) {
      throw new Error('Invalid RLE data');
    }

    const { width, height, runs } = rleData;
    const binaryArray = this.decodeRunLength(runs);

    return {
      width,
      height,
      rgbaData: this.binaryToRgba(binaryArray),
    };
  }
}
