import { readImg } from 'image-js';
import { useCallback, useEffect, useState } from 'react';
import type { Mask } from 'image-js';

export const algorithms = [
  'manual',
  'huang',
  'intermodes',
  'isodata',
  'li',
  'maxEntropy',
  'mean',
  'minimum',
  'minError',
  'moments',
  'otsu',
  'percentile',
  'renyiEntropy',
  'shanbhag',
  'triangle',
  'yen',
] as const;

export type Algorithm = (typeof algorithms)[number];

function imageToUrl(image: Mask, invert: boolean, callback: (url: string) => void) {
  const { width, height } = image;
  const raw = image.getRawImage().data;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Without the following steps pixels are invisible
  // as we're working with ImageJS's "Mask" object here.
  // We can turn the mask into visible pixels by mapping
  // the "on" or "off" states onto a canvas, where 0 represents
  // white and 1 black.
  if (ctx) {
    // Prepare an RGBA output buffer
    const output = new Uint8ClampedArray(width * height * 4);

    // Convert raw binary data into opaque pixels
    for (let i = 0; i < width * height; i++) {
      const v = raw[i] ? (invert ? 0 : 255) : invert ? 255 : 0; // On or off → white or black
      const idx = i * 4; // RGBA stride
      output[idx] = v; // R
      output[idx + 1] = v; // G
      output[idx + 2] = v; // B
      output[idx + 3] = 255; // A (fully opaque)
    }

    // Paint the final image onto the canvas
    const imgData = new ImageData(output, width, height);
    ctx.putImageData(imgData, 0, 0);
  }

  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      callback(url);
    }
  }, 'image/png');
}

export default function useImageThreshold(
  file: File | null,
  thresholdValue: number,
  algorithm: Algorithm,
  invert: boolean
) {
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [thresholdedUrl, setThresholdedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const processImage = useCallback(() => {
    if (!file) {
      setOriginalUrl(null);
      setThresholdedUrl(null);
      return;
    }

    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setOriginalUrl(dataUrl);

      const img = new Image();
      img.onload = async () => {
        try {
          const image = readImg(img);
          const grayImage = image.grey();

          // We need dynamic properties here as any threshold value
          // will overide the algorithm
          const thresholdedImage = grayImage.threshold({
            ...(algorithm !== 'manual'
              ? { algorithm }
              : { threshold: thresholdValue / 255 }),
          });

          imageToUrl(thresholdedImage, invert, (url) => {
            setThresholdedUrl(url);
          });
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
      img.src = dataUrl;
    };

    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      setProcessing(false);
    };

    reader.readAsDataURL(file);
  }, [algorithm, file, invert, thresholdValue]);

  useEffect(() => {
    processImage();
    return () => {
      if (originalUrl) {
        URL.revokeObjectURL(originalUrl);
      }
    };
  }, [processImage, invert]);

  return { originalUrl, thresholdedUrl, processing, processImage };
}
