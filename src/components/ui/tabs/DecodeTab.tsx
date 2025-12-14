import { useState } from 'react';
import RLEImageProcessor from '../../../utils/rleImageProcessor';
import ImageCard from '../../shared/ImageCard';

export default function DecodeTab() {
  const [encodedData, setEncodedData] = useState('');
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

  return (
    <div className='grid grid-cols-1 gap-4'>
      <div className='card bg-[#0a0a0a] border border-base-300 p-4 rounded-lg'>
        <h3 className='card-title text-xl font-semibold mb-3'>Input Encoded Data</h3>
        <textarea
          className='textarea w-full font-mono'
          placeholder='Paste the RLE encoded data here...'
          value={encodedData}
          onChange={(e) => setEncodedData(e.target.value)}
        />
        <button className='btn mt-4' onClick={handleDecode} disabled={processing}>
          {processing ? 'Decoding...' : 'Decode'}
        </button>
        {error && <p className='text-red-500 mt-2 text-center'>{error}</p>}
      </div>

      <ImageCard
        title='Decoded Image'
        nullText='Decoded image will appear here.'
        url={decodedImageUrl}
        processing={processing}
        altText='Decoded image from RLE data'
      />
    </div>
  );
}
