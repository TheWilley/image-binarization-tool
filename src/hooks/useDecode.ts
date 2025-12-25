import { useState } from 'react';
import RLEImageProcessor from '../utils/rleImageProcessor';

export default function useDecode(encodedData: string) {
  const [decodedImageUrl, setDecodedImageUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDecode = () => {
    if (!encodedData.trim()) return;

    try {
      setProcessing(true);

      // Decode the RLE data into RGBA format
      const { width, height, rgbaData } = RLEImageProcessor.decodeImageData(encodedData);

      // Create a canvas to render the decoded image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        const clamped = new Uint8ClampedArray(rgbaData);
        const imageData = new ImageData(clamped, width, height);
        ctx.putImageData(imageData, 0, 0);

        // Convert the canvas to a data URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setDecodedImageUrl(url);
          }
          setProcessing(false);
        });

        setError(null);
      }
    } catch (error) {
      console.error('Failed to decode image:', error);
      setError('Failed to decode image. Please check the encoded data format.');
      setProcessing(false);
    }
  };

  return {
    handleDecode,
    decodedImageUrl,
    processing,
    error,
  };
}
