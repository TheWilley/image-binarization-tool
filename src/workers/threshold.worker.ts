import { Image, computeThreshold } from 'image-js';
import RLEImageProcessor from '../utils/rleImageProcessor';
import { hexToRgb } from '../utils/hexToRgb';
import type { Algorithm, Colors } from '../global/types';

/**
 * The worker is stateful. The expensive, setting-independent work is done once
 * per image ("load") and cached, so changing a setting only redoes the part
 * that actually depends on it ("process"):
 *
 *   load:    RGBA pixels -> greyscale                    (once per image)
 *   process: greyscale   -> threshold value              (when algorithm / slider changes)
 *            threshold   -> binary mask                  (when the threshold value changes)
 *            mask        -> invert + colors + RLE string (when anything changes)
 */
export interface LoadRequest {
  type: 'load';
  id: number;
  width: number;
  height: number;
  /** RGBA pixel data of the source image */
  data: Uint8ClampedArray;
}

export interface ProcessRequest {
  type: 'process';
  id: number;
  algorithm: Algorithm | undefined;
  thresholdValue: number;
  invert: boolean;
  colors: Colors;
}

export type ThresholdWorkerRequest = LoadRequest | ProcessRequest;

export type ThresholdWorkerResponse =
  | { id: number; ok: true; type: 'load' }
  | {
      id: number;
      ok: true;
      type: 'process';
      width: number;
      height: number;
      output: Uint8ClampedArray<ArrayBuffer>;
      encodedData: string;
    }
  | { id: number; ok: false; error: string };

// ---- Cached state --------------------------------------------------------

let width = 0;
let height = 0;
/** One 8-bit greyscale value per pixel for the currently loaded image */
let grey: Uint8Array | null = null;

/** Cache of the algorithm's threshold, which only depends on the greyscale image */
let cachedAlgorithm: Algorithm | undefined;
let cachedAlgorithmThreshold = 0;
let hasAlgorithmThreshold = false;

/** Cache of the mask, which only depends on the threshold value */
let mask: Uint8Array | null = null;
let maskThreshold = NaN;

// ---- Helpers -------------------------------------------------------------

const post = (response: ThresholdWorkerResponse, transfer: Transferable[] = []) =>
  (self as unknown as Worker).postMessage(response, transfer);

function load(req: LoadRequest) {
  width = req.width;
  height = req.height;

  // Wrap the received RGBA pixels in an image-js Image and convert to greyscale
  const image = new Image(width, height, {
    data: new Uint8Array(req.data.buffer, req.data.byteOffset, req.data.byteLength),
    colorModel: 'RGBA',
  });
  grey = image.grey().getRawImage().data as Uint8Array;

  // A new image invalidates everything derived from the old one
  hasAlgorithmThreshold = false;
  mask = null;
  maskThreshold = NaN;
}

function process(req: ProcessRequest) {
  if (!grey) throw new Error('No image loaded');
  const { algorithm, thresholdValue, invert, colors } = req;
  const pixelCount = width * height;

  // 1. Find the threshold value.
  // A manual value always wins over the algorithm.
  let threshold: number;
  if (algorithm === 'manual') {
    threshold = (thresholdValue / 255) * 255;
  } else {
    // Computing this needs a histogram of the whole image, so only redo it
    // when the algorithm changes.
    if (!hasAlgorithmThreshold || cachedAlgorithm !== algorithm) {
      const greyImage = new Image(width, height, { data: grey, colorModel: 'GREY' });
      cachedAlgorithmThreshold = computeThreshold(greyImage, { algorithm });
      cachedAlgorithm = algorithm;
      hasAlgorithmThreshold = true;
    }
    threshold = cachedAlgorithmThreshold;
  }

  // 2. Build the binary mask (1 = brighter than the threshold).
  // Skipped when only invert or colors changed, or when two different
  // slider positions give the same threshold.
  if (!mask || maskThreshold !== threshold) {
    mask = new Uint8Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      mask[i] = grey[i] > threshold ? 1 : 0;
    }
    maskThreshold = threshold;
  }

  // 3. Apply invert and paint the pixels with the chosen colors,
  // while building the binary array the RLE encoder needs in the same pass.
  // This avoids converting RGBA back into binary afterwards.
  const above = hexToRgb(colors.aboveThresholdColor);
  const below = hexToRgb(colors.belowThresholdColor);
  const output = new Uint8ClampedArray(pixelCount * 4);
  const binary = new Uint8Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const bit = invert ? 1 - mask[i] : mask[i];
    const color = bit ? above : below;
    const idx = i * 4;
    output[idx] = color.r;
    output[idx + 1] = color.g;
    output[idx + 2] = color.b;
    output[idx + 3] = 255;
    binary[i] = bit;
  }

  // 4. Compress into the run-length encoded string shown in the UI
  const encodedData = new RLEImageProcessor().processBinaryData(width, height, binary, colors);

  // Transfer the pixel buffer back instead of copying it
  post({ id: req.id, ok: true, type: 'process', width, height, output, encodedData }, [
    output.buffer,
  ]);
}

// ---- Message handling ----------------------------------------------------

self.onmessage = (e: MessageEvent<ThresholdWorkerRequest>) => {
  const req = e.data;

  try {
    if (req.type === 'load') {
      load(req);
      post({ id: req.id, ok: true, type: 'load' });
    } else {
      process(req);
    }
  } catch (error) {
    // Errors can't be thrown across threads, so report them as a message
    post({
      id: req.id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};
