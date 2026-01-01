import type { Colors, Hex, RLEData } from '../global/types';
import { hexToRgb } from './hexToRgb';
import { prefixHex } from './prefixHex';

export default class RLEImageProcessor {
  private rgbaToBinary(rgbaArray: Uint8ClampedArray, colors: Colors) {
    const pixelCount = rgbaArray.length / 4;
    const binaryArray = new Array(pixelCount);

    const above = hexToRgb(colors.aboveThresholdColor);
    const below = hexToRgb(colors.belowThresholdColor);

    const { r: br, g: bg, b: bb } = below;
    const { r: ar, g: ag, b: ab } = above;

    for (let i = 0; i < pixelCount; i++) {
      const offset = i * 4;
      const r = rgbaArray[offset];
      const g = rgbaArray[offset + 1];
      const b = rgbaArray[offset + 2];

      // Check "below" threshold
      if (r === br && g === bg && b === bb) {
        binaryArray[i] = 0;
      }
      // Check "above" threshold
      else if (r === ar && g === ag && b === ab) {
        binaryArray[i] = 1;
      }
    }

    return binaryArray;
  }

  private binaryToRgba(binaryArray: number[], colors: Colors) {
    const rgbaArray = new Uint8ClampedArray(binaryArray.length * 4);

    const above = hexToRgb(colors.aboveThresholdColor);
    const below = hexToRgb(colors.belowThresholdColor);

    for (let i = 0; i < binaryArray.length; i++) {
      const pixelIndex = i * 4;

      const color = binaryArray[i] ? above : below;

      rgbaArray[pixelIndex] = color.r;
      rgbaArray[pixelIndex + 1] = color.g;
      rgbaArray[pixelIndex + 2] = color.b;
      rgbaArray[pixelIndex + 3] = 255; // Alpha
    }

    return rgbaArray;
  }

  private encodeRunLength(binaryArray: number[]) {
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

  private decodeRunLength(encoded: number[]) {
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

  private stringifyRunLength(data: RLEData) {
    return `${data.width}|${data.height}|${prefixHex(
      data.colors.belowThresholdColor,
      'remove'
    )}|${prefixHex(data.colors.aboveThresholdColor, 'remove')}|${data.runs.join(',')}`;
  }

  private parseRunLengthString(str: string) {
    try {
      const parts = str.split('|');
      if (parts.length < 5) return null;

      const width = parseInt(parts[0], 10);
      const height = parseInt(parts[1], 10);
      const below = prefixHex(String(parts[2]) as Hex, 'add');
      const above = prefixHex(String(parts[3]) as Hex, 'add');
      const runsStr = String(parts[4]);

      if (isNaN(width) || isNaN(height)) {
        return null;
      }

      const runs =
        runsStr.trim() === '' ? [] : runsStr.split(',').map((n) => parseInt(n, 10));

      const colors: Colors = {
        aboveThresholdColor: above,
        belowThresholdColor: below,
      };

      if (runs.some(isNaN)) return null;

      return {
        width,
        height,
        runs,
        colors,
      };
    } catch {
      return null;
    }
  }

  public processImageData(
    width: number,
    height: number,
    rgbaData: Uint8ClampedArray,
    colors: Colors
  ) {
    const binaryArray = this.rgbaToBinary(rgbaData, colors);
    const runs = this.encodeRunLength(binaryArray);
    const rleData: RLEData = {
      colors,
      width,
      height,
      runs,
    };
    return this.stringifyRunLength(rleData);
  }

  public decodeImageData(data: string) {
    const rleData = this.parseRunLengthString(data);
    if (!rleData) {
      throw new Error('Invalid RLE data');
    }

    const { width, height, runs, colors } = rleData;
    const binaryArray = this.decodeRunLength(runs);
    const rgbaData = this.binaryToRgba(binaryArray, colors);

    return {
      width,
      height,
      rgbaData,
    };
  }
}
