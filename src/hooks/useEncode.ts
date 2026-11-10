import { useCallback, useEffect, useState } from 'react';
import { type Algorithm, type Colors } from '../global/types';
import type {
  ThresholdWorkerRequest,
  ThresholdWorkerResponse,
} from '../workers/threshold.worker';

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

/**
 * Runs the heavy thresholding + RLE work in a web worker so the UI stays responsive.
 * Only canvas access (which needs the DOM) happens on the main thread.
 */
function applyThresholding(
  imgElement: HTMLImageElement,
  options: {
    algorithm: Algorithm | undefined;
    thresholdValue: number;
    invert: boolean;
    colors: Colors;
  }
) {
  const { width, height } = imgElement;

  // Workers have no DOM access, so read the raw pixels here first
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceCtx = sourceCanvas.getContext('2d');
  if (!sourceCtx) return Promise.reject(new Error('Could not get canvas context'));
  sourceCtx.drawImage(imgElement, 0, 0);
  const { data } = sourceCtx.getImageData(0, 0, width, height);

  const w = getWorker();
  const id = nextRequestId++;

  return new Promise<{ url: string; encodedData: string }>((resolve, reject) => {
    const cleanup = () => {
      w.removeEventListener('message', onMessage);
      w.removeEventListener('error', onError);
    };

    const onMessage = (e: MessageEvent<ThresholdWorkerResponse>) => {
      const res = e.data;
      // Ignore responses that belong to other (older/newer) requests
      if (res.id !== id) return;
      cleanup();

      if (!res.ok) {
        reject(new Error(res.error));
        return;
      }

      // Turn the thresholded pixels from the worker into a PNG we can display
      const canvas = document.createElement('canvas');
      canvas.width = res.width;
      canvas.height = res.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.putImageData(new ImageData(res.output, res.width, res.height), 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Could not create image blob'));
          return;
        }
        resolve({ url: URL.createObjectURL(blob), encodedData: res.encodedData });
      }, 'image/png');
    };

    const onError = (e: ErrorEvent) => {
      cleanup();
      reject(new Error(e.message));
    };

    w.addEventListener('message', onMessage);
    w.addEventListener('error', onError);

    // The pixel buffer is transferred (not copied) to keep large images fast
    const request: ThresholdWorkerRequest = { id, width, height, data, ...options };
    w.postMessage(request, [data.buffer]);
  });
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

  const processImage = useCallback(() => {
    if (!file) {
      setOriginalUrl(null);
      setThresholdedUrl(null);
      return;
    }

    if (file && file.size > 1000000) {
      setFileIsLarge(true);
    } else {
      setFileIsLarge(false);
    }

    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalUrl(dataUrl);

      const img = new Image();
      img.src = dataUrl;

      img.onload = async () => {
        try {
          const { url, encodedData } = await applyThresholding(img, {
            algorithm,
            thresholdValue,
            invert,
            colors,
          });

          setEncodedData(encodedData);
          setThresholdedUrl(url);
        } catch (error) {
          console.error('Error processing image:', error);
          setThresholdedUrl(null);
        } finally {
          setProcessing(false);
        }
      };

      img.onerror = () => {
        console.error('Error loading image into HTMLImageElement.');
        setProcessing(false);
      };
    };

    reader.readAsDataURL(file);
  }, [algorithm, colors, file, invert, thresholdValue]);

  useEffect(() => {
    processImage();
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
    };
  }, [processImage, invert]);

  return {
    originalUrl,
    thresholdedUrl,
    processing,
    encodedData,
    fileIsLarge,
    processImage,
  };
}
