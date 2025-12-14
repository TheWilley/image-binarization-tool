import { useState } from 'react';
import type { Algorithm } from '../../../hooks/useThreshold';
import Setting from '../../Settings';
import Results from '../../Results';
import Actions from '../../Actions';
import EncodedData from '../EncodedData';
import useImageThreshold from '../../../hooks/useThreshold';

export default function EncodeTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [algorithm, setAlgorithm] = useState<Algorithm>('otsu');
  const [invert, setInvert] = useState(false);

  const { originalUrl, thresholdedUrl, processing, encodedData } = useImageThreshold(
    selectedFile,
    threshold,
    algorithm,
    invert
  );

  return (
    <>
      <Setting
        threshold={threshold}
        selectedFile={selectedFile}
        processing={processing}
        algorithm={algorithm}
        setSelectedFile={setSelectedFile}
        setThreshold={setThreshold}
        setAlgorithm={setAlgorithm}
        setInvert={setInvert}
        invert={invert}
      />

      <Results
        algorithm={algorithm}
        originalUrl={originalUrl}
        processing={processing}
        threshold={threshold}
        thresholdedUrl={thresholdedUrl}
      />

      <Actions url={thresholdedUrl} processing={processing} />
      <EncodedData encodedData={encodedData} />
    </>
  );
}
