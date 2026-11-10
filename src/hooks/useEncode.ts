import { useEffect, useState } from 'react';
import { type Algorithm, type Colors } from '../global/types';
import type {
  ThresholdWorkerRequest,
  ThresholdWorkerResponse,
} from '../workers/threshold.worker';
import { compressImage } from '../utils/compressImage.ts';

// A single worker is shared by the whole app and created lazily on first use.
// Each request gets an id so we can match a response to the call that made it.
// So a listener cannot receive an older / newer result if many calls were made at the same time.
let worker: Worker | null = null;
let nextRequestId = 0;

function getWorker() {
  if (!worker) {
    worker = new Worker(new URL('../workers/threshold.worker.ts', import.meta.url), {
      type: 'module',
    });
  }
  return worker;
}

type SuccessResponse = Extract<ThresholdWorkerResponse, { ok: true }>;

/**
 * Sends a request to the worker and resolves with the response that carries
 * the same id. The worker handles messages in order, so a "load" sent before
 * a "process" is always finished first.
 */
function request(
  message: DistributiveOmit<ThresholdWorkerRequest, 'id'>,
  transfer: Transferable[] = []
) {
  const w = getWorker();
  const id = nextRequestId++;

  return new Promise<SuccessResponse>((resolve, reject) => {
    const cleanup = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
    };

    const onMessage = (e: MessageEvent<ThresholdWorkerResponse>) => {
      const res = e.data;
      // Ignore responses that belong to other (older/newer) requests
      if (res.id !== id) return;
      cleanup();

      if (res.ok) resolve(res);
      else reject(new Error(res.error));
    };

    const onError = (e: ErrorEvent) => {
      cleanup();
      reject(new Error(e.message));
    };

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);
    w.postMessage({ ...message, id }, transfer);
  });
}

// Omit that keeps working on each member of a union type
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;

/**
 * Decodes the file once and hands its pixels to the worker, which keeps a
 * greyscale copy. After this, changing settings never has to touch the file again.
 */
async function loadFileIntoWorker(file: File) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;

  // Workers have no DOM access, so read the raw pixels here
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, width, height);
  // The pixel buffer is transferred (not copied) to keep large images fast
  await request({ type: 'load', width, height, data }, [data.buffer]);
}

/**
 * Asks the worker to threshold the loaded image with the given settings and
 * turns the returned pixels into a PNG we can display.
 */
async function thresholdLoadedImage(options: {
  algorithm: Algorithm | undefined;
  thresholdValue: number;
  invert: boolean;
  colors: Colors;
}) {
  const res = await request({ type: 'process', ...options });
  if (res.type !== 'process') throw new Error('Unexpected worker response');

  const canvas = document.createElement('canvas');
  canvas.width = res.width;
  canvas.height = res.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.putImageData(new ImageData(res.output, res.width, res.height), 0, 0);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Could not create image blob');

  return { url: URL.createObjectURL(blob), encodedData: res.encodedData };
}

export default function useEncode(
  file: File | null,
  thresholdValue: number,
  algorithm: Algorithm,
  invert: boolean,
  colors: Colors
) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [thresholdedUrl, setThresholdedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [encodedData, setEncodedData] = useState<string>('');
  const [fileIsLarge, setFileIsLarge] = useState<boolean>(false);
  // The file whose pixels the worker currently holds
  const [loadedFile, setLoadedFile] = useState<File | null>(null);

  // Runs only when the file changes: show the original and load it into the worker.
  useEffect(() => {
    if (!file) {
      setOriginalUrl(null);
      setThresholdedUrl(null);
      setLoadedFile(null);
      return;
    }

    let cancelled = false;
    setFileIsLarge(file.size > 1000000);
    setProcessing(true);

    // Compress the image, to be shown besides the thresholded image.
    // We don't need to display the full resolution image, it's only a comparison to the thresholded.
    let url: string | null = null;
    compressImage(file, 50)
      .then((compressed) => {
        if (cancelled) return;
        url = URL.createObjectURL(compressed);
        setOriginalUrl(url);
      })
      .catch((error) => console.error('Error compressing image:', error));

    loadFileIntoWorker(file)
      .then(() => {
        if (!cancelled) setLoadedFile(file);
      })
      .catch((error) => {
        console.error('Error loading image:', error);
        if (!cancelled) setProcessing(false);
      });

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // Runs when the image finished loading or any setting changes.
  // This is the cheap path: only the settings are sent to the worker.
  useEffect(() => {
    // Wait until the worker holds the current file (not a previous one)
    if (!file || loadedFile !== file) return;

    let cancelled = false;
    setProcessing(true);

    thresholdLoadedImage({ algorithm, thresholdValue, invert, colors })
      .then(({ url, encodedData }) => {
        // Drop results from settings that have already been replaced
        if (cancelled) return;
        setEncodedData(encodedData);
        setThresholdedUrl(url);
      })
      .catch((error) => {
        console.error('Error processing image:', error);
        if (!cancelled) setThresholdedUrl(null);
      })
      .finally(() => {
        if (!cancelled) setProcessing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [file, loadedFile, algorithm, thresholdValue, invert, colors]);

  return {
    originalUrl,
    thresholdedUrl,
    processing,
    encodedData,
    fileIsLarge,
  };
}
