import { useState, type ChangeEvent } from 'react';
import { algorithms, type Algorithm } from '../../../hooks/useEncode';
import type { Setter } from '../../../global/types';

export default function Setting({
  selectedFile,
  setThreshold,
  processing,
  algorithm,
  invert,
  setSelectedFile,
  setAlgorithm,
  setInvert,
}: {
  selectedFile: File | null;
  threshold: number;
  setThreshold: Setter<number>;
  processing: boolean;
  algorithm: Algorithm;
  invert: boolean;
  setSelectedFile: Setter<File | null>;
  setAlgorithm: Setter<Algorithm>;
  setInvert: Setter<boolean>;
}) {
  const [localThreshold, setLocalThreshold] = useState(128);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleThresholdChange = (event: ChangeEvent<HTMLInputElement>) => {
    setLocalThreshold(Number(event.target.value));
  };

  const handleThresholdChangeCommit = () => {
    setThreshold(localThreshold);
  };

  const handleModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setAlgorithm(event.target.value as Algorithm);
  };

  const handleInvertChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setInvert(event.target.checked);
  };

  return (
    <div className='card bg-[#0a0a0a] border rounded-lg border-base-300 w-full mb-4'>
      <div className='card-body'>
        <div className='form-control mb-2'>
          <label className='label'>
            <span className='label-text font-semibold mb-2'>
              Upload Image (.jpg or .png)
            </span>
          </label>
          <input
            type='file'
            accept='image/*'
            onChange={handleFileChange}
            className='file-input file-input-bordered w-full'
          />
        </div>

        <fieldset className='fieldset border border-base-300 p-3 rounded-md shadow-md shadow-black'>
          <legend className='fieldset-legend'>Settings</legend>
          <div className='form-control mb-6'>
            <label className='label'>
              <span className='label-text font-semibold mb-2'>Threshold Algorithm</span>
            </label>
            <select
              value={algorithm}
              onChange={handleModeChange}
              className='select select-bordered select-primary w-full'
              disabled={!selectedFile || processing}
            >
              {algorithms.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          {algorithm === 'manual' && (
          <div className='form-control mb-6'>
            <label className='label'>
              <span className='label-text font-semibold mb-2'>
                Threshold Value (0–255):{' '}
                  <span className='text-base-content'>{localThreshold}</span>{' '}
              </span>
            </label>
            <input
              type='range'
              min='0'
              max='255'
              value={localThreshold}
              onChange={handleThresholdChange}
              onMouseUp={handleThresholdChangeCommit}
              onTouchEnd={handleThresholdChangeCommit}
                disabled={!selectedFile || processing}
              className='range range-primary w-full'
            />
          </div>
          )}
          <div className='form-control mb-6'>
            <label className='label'>
              <input
                type='checkbox'
                checked={invert}
                onChange={handleInvertChange}
                disabled={!selectedFile || processing}
                className='toggle toggle-primary'
              />
              Invert Colors
            </label>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
