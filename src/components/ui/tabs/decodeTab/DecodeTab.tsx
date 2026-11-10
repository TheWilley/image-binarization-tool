import { useState } from 'react';
import Results from '../../../shared/Results';
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

      <Results
        title='Decoded Image'
        processing={processing}
        ready={!!decodedImageUrl}
        emptyLabel='Decoded image will appear here'
      >
        {decodedImageUrl && (
          <img
            src={decodedImageUrl}
            alt='Decoded image from RLE data'
            className='w-full h-full object-contain max-h-[60vh]'
          />
        )}
      </Results>
      <Actions processing={processing} url={decodedImageUrl} />
    </div>
  );
}
