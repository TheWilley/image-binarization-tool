import { Image } from 'image-js';
import type { ThresholdOptions } from 'image-js';
import RLEImageProcessor from '../utils/rleImageProcessor';
import { hexToRgb } from '../utils/hexToRgb';
import type { Algorithm, Colors } from '../global/types';

export interface ThresholdWorkerRequest {
  id: number;
  width: number;
  height: number;
  data: Uint8ClampedArray;
  algorithm: Algorithm | undefined;
  thresholdValue: number;
  invert: boolean;
  colors: Colors;
}

export type ThresholdWorkerResponse =
  | {
      id: number;
      ok: true;
      width: number;
      height: number;
      output: Uint8ClampedArray<ArrayBuffer>;
      encodedData: string;
    }
  | { id: number; ok: false; error: string };

self.onmessage = (e: MessageEvent<ThresholdWorkerRequest>) => {
  const { id, width, height, data, algorithm, thresholdValue, invert, colors } = e.data;

  try {
    // Wrap the received RGBA pixels in an image-js Image and convert to greyscale
    const image = new Image(width, height, {
      data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
      colorModel: 'RGBA',
    });
    const grayImage = image.grey();

    // Any threshold value overrides the algorithm
    const thresholdOptions: ThresholdOptions =
      algorithm !== 'manual' ? { algorithm } : { threshold: thresholdValue / 255 };
    const mask = grayImage.threshold(thresholdOptions);
    const raw = mask.getRawImage().data;

    // Paint the black/white mask using the user's chosen colors
    // (swapped when "invert" is on)
    const above = hexToRgb(colors.aboveThresholdColor);
    const below = hexToRgb(colors.belowThresholdColor);
    const output = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < width * height; i++) {
      const isPixelOn = !!raw[i];
      const color = (invert ? !isPixelOn : isPixelOn) ? above : below;
      const idx = i * 4;
      output[idx] = color.r;
      output[idx + 1] = color.g;
      output[idx + 2] = color.b;
      output[idx + 3] = 255;
    }

    // Compress the result into the run-length encoded string shown in the UI
    const encodedData = new RLEImageProcessor().processImageData(width, height, output, colors);

    // Send the result back, transferring the buffer instead of copying it
    const response: ThresholdWorkerResponse = { id, ok: true, width, height, output, encodedData };
    (self as unknown as Worker).postMessage(response, [output.buffer]);
  } catch (error) {
    // Errors can't be thrown across threads, so report them as a message
    const response: ThresholdWorkerResponse = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
    (self as unknown as Worker).postMessage(response);
  }
};
