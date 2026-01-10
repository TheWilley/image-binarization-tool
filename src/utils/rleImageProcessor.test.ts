import { describe, it, expect } from 'vitest';
import RLEImageProcessor from './rleImageProcessor';
import type { Colors } from '../global/types';

describe('RLEImageProcessor', () => {
  const processor = new RLEImageProcessor();
  const colors: Colors = {
    aboveThresholdColor: '#ffffff',
    belowThresholdColor: '#000000',
  };

  it('should convert RGBA to binary correctly', () => {
    const rgbaArray = new Uint8ClampedArray([
      255,
      255,
      255,
      255, // white
      0,
      0,
      0,
      255, // black
    ]);
    const binary = processor['rgbaToBinary'](rgbaArray, colors);
    expect(binary).toEqual(new Uint8Array([1, 0]));
  });

  it('should convert binary to RGBA correctly', () => {
    const binaryArray = new Uint8Array([1, 0]);
    const rgba = processor['binaryToRgba'](binaryArray, colors);
    expect(rgba).toEqual(
      new Uint8ClampedArray([
        255,
        255,
        255,
        255, // white
        0,
        0,
        0,
        255, // black
      ])
    );
  });

  it('should encode image data to RLE format', () => {
    const rgbaArray = new Uint8ClampedArray([
      255,
      255,
      255,
      255, // white
      255,
      255,
      255,
      255, // white
      0,
      0,
      0,
      255, // black
      0,
      0,
      0,
      255, // black
    ]);
    const rleData = processor.processImageData(2, 2, rgbaArray, colors);
    expect(rleData).toEqual('2|2|000000|ffffff|1,2,2');
  });

  it('should reconstruct RGBA from RLE data', () => {
    const rleData = '2|2|000000|ffffff|1,2,2';
    const rgba = processor.decodeImageData(rleData);
    expect(rgba).toEqual({
      width: 2,
      height: 2,
      rgbaData: new Uint8ClampedArray([
        255,
        255,
        255,
        255, // white
        255,
        255,
        255,
        255, // white
        0,
        0,
        0,
        255, // black
        0,
        0,
        0,
        255, // black
      ]),
    });
  });
});
