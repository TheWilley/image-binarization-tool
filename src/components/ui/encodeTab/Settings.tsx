import { useState, type ChangeEvent } from 'react';
import { algorithms } from '../../../data/algorithms';
import type { Colors, Setter, Algorithm } from '../../../global/types';
import { ThresholdAlgorithm } from './ThresholdAlgorithm';

export default function Setting({
  selectedFile,
  setThreshold,
  processing,
  algorithm,
  invert,
  colors,
  setSelectedFile,
  setAlgorithm,
  setInvert,
  setColors,
}: {
  selectedFile: File | null;
  threshold: number;
  setThreshold: Setter<number>;
  processing: boolean;
  algorithm: Algorithm;
  invert: boolean;
  colors: Colors;
  setSelectedFile: Setter<File | null>;
  setAlgorithm: Setter<Algorithm>;
  setInvert: Setter<boolean>;
  setColors: Setter<Colors>;
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
    setInvert(event.target.checked);
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setColors((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDefaultChange = () => {
    if (
      colors.aboveThresholdColor !== '#ffffff' ||
      colors.belowThresholdColor !== '#000000'
    )
      setColors({
        aboveThresholdColor: '#ffffff',
        belowThresholdColor: '#000000',
      });
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
            <ThresholdAlgorithm algorithm={algorithm} />
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
              <span className='label-text font-semibold mb-2'>Colors</span>
            </label>
            <br />
            <label className='label'>
              <input
                type='color'
                name='aboveThresholdColor'
                value={colors.aboveThresholdColor}
                onChange={handleColorChange}
                disabled={!selectedFile || processing}
                className=''
              />
              Above Threshold
            </label>
            <br />
            <label className='label mt-2'>
              <input
                type='color'
                name='belowThresholdColor'
                value={colors.belowThresholdColor}
                onChange={handleColorChange}
                disabled={!selectedFile || processing}
                className=''
              />
              Below Threshold
            </label>
            <br />
            <button
              className='btn btn-sm mt-2'
              onClick={handleDefaultChange}
              disabled={
                colors.aboveThresholdColor == '#ffffff' &&
                colors.belowThresholdColor == '#000000'
              }
            >
              Default
            </button>
          </div>

          <div className='form-control mb-6'>
            <label className='label'>
              <span className='label-text font-semibold mb-2'>Modifiers</span>
            </label>
            <br />
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
