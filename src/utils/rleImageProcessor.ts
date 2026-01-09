import { RLE_SCHEMA, RLE_SEPERATOR } from '../data/rleSchema';
import type { Colors, Hex, RLEData } from '../global/types';
import { hexToRgb } from './hexToRgb';
import { prefixHex } from './prefixHex';

export default class RLEImageProcessor {
  /**
   * Converts RGBA image data to a binary representation based on threshold colors.
   * @param rgbaArray The RGBA image data array.
   * @param colors The colors used for thresholding.
   * @returns A Uint8Array representing the binary image data.
   */
  private rgbaToBinary(rgbaArray: Uint8ClampedArray, colors: Colors) {
    const pixelCount = rgbaArray.length / 4;
    const binaryArray = new Uint8Array(pixelCount);

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

  /**
   * Converts a binary representation of an image back to RGBA format.
   * @param binaryArray The binary image data array.
   * @param colors The colors used for thresholding.
   * @returns A Uint8ClampedArray representing the RGBA image data.
   */
  private binaryToRgba(binaryArray: Uint8Array, colors: Colors) {
    const rgbaArray = new Uint8ClampedArray(binaryArray.length * 4);

    const above = hexToRgb(colors.aboveThresholdColor);
    const below = hexToRgb(colors.belowThresholdColor);

    for (let i = 0; i < binaryArray.length; i++) {
      const pixelIndex = i * 4;
      const color = binaryArray[i] === 1 ? above : below;

      rgbaArray[pixelIndex] = color.r;
      rgbaArray[pixelIndex + 1] = color.g;
      rgbaArray[pixelIndex + 2] = color.b;
      rgbaArray[pixelIndex + 3] = 255;
    }

    return rgbaArray;
  }

  /**
   * Encodes a binary array using a modified run-length encoding (RLE).
   * @param binaryArray The binary image data array.
   * @returns An array of numbers representing the run-length encoded data.
   */
  private encodeRunLength(binaryArray: Uint8Array) {
    if (binaryArray.length === 0) return [];

    const encoded: number[] = [];
    let previous = binaryArray[0];

    // The first value in encoded is the starting bit (0 or 1)
    encoded.push(previous);

    let count = 0;
    for (let i = 0; i < binaryArray.length; i++) {
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

  /**
   * Decodes a run-length encoded array back to a binary array.
   * @param encoded The run-length encoded data array.
   * @returns A Uint8Array representing the binary image data.
   */
  private decodeRunLength(encoded: number[]) {
    if (encoded.length === 0) return new Uint8Array(0);

    // Calculate total size to pre-allocate memory
    // Start i at 1 because encoded[0] is the starting value
    let totalLength = 0;
    for (let i = 1; i < encoded.length; i++) {
      totalLength += encoded[i];
    }

    const binaryArray = new Uint8Array(totalLength);
    let currentValue = encoded[0];

    let offset = 0;
    for (let i = 1; i < encoded.length; i++) {
      const runLength = encoded[i];
      binaryArray.fill(currentValue, offset, offset + runLength);
      offset += runLength;
      currentValue = 1 - currentValue;
    }

    return binaryArray;
  }

  /**
   * Serializes RLEData into a string format.
   * @param data The RLEData object to serialize.
   * @returns A string representing the serialized RLE data.
   */
  private stringifyRunLength(data: RLEData) {
    const segments = [
      data.width,
      data.height,
      prefixHex(data.colors.belowThresholdColor, 'remove'),
      prefixHex(data.colors.aboveThresholdColor, 'remove'),
      data.runs.join(','),
    ];
    return segments.join(RLE_SEPERATOR);
  }

  /**
   * Parses a run-length encoded string into an RLEData object.
   * @param str The RLE string to parse.
   * @returns An RLEData object or null if parsing fails.
   */
  private parseRunLengthString(str: string) {
    const parts = str.split(RLE_SEPERATOR);

    // Validation against schema length
    if (parts.length < RLE_SCHEMA.length) return null;

    // Destructure for readability
    const [wStr, hStr, belowHex, aboveHex, runsStr] = parts;

    const width = parseInt(wStr, 10);
    const height = parseInt(hStr, 10);

    if (isNaN(width) || isNaN(height)) return null;

    return {
      width,
      height,
      colors: {
        belowThresholdColor: prefixHex(belowHex as Hex, 'add'),
        aboveThresholdColor: prefixHex(aboveHex as Hex, 'add'),
      },
      runs: runsStr ? runsStr.split(',').map(Number) : [],
    };
  }

  /**
   * Processes RGBA image data into a run-length encoded string.
   * @param width The width of the image.
   * @param height The height of the image.
   * @param rgbaData The RGBA image data array.
   * @param colors The colors used for thresholding.
   * @returns A string representing the run-length encoded image data.
   */
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

  /**
   * Decodes a run-length encoded string back into RGBA image data.
   * @param data The RLE string to decode.
   * @returns An object containing width, height, and RGBA image data array.
   */
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
