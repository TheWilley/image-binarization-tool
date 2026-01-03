import { useState } from 'react';
import ImageCard from '../../../shared/ImageCard';
import Actions from '../../../shared/Actions';
import useDecode from '../../../../hooks/useDecode';

export default function DecodeTab() {
  const [encodedData, setEncodedData] = useState('');
  const { handleDecode, decodedImageUrl, processing, error } = useDecode(encodedData);

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
        nullText='Decoded image will appear here'
        url={decodedImageUrl}
        processing={processing}
        altText='Decoded image from RLE data'
      />
      <Actions processing={processing} url={decodedImageUrl} />
    </div>
  );
}
