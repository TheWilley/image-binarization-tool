import { useState } from 'react';
import type { Algorithm } from '../../../hooks/useEncode';
import Setting from '../encodeTab/Settings';
import Results from '../../shared/Results';
import Actions from '../encodeTab/Actions';
import EncodedData from '../encodeTab/EncodedData';
import useEncode from '../../../hooks/useEncode';

export default function EncodeTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [algorithm, setAlgorithm] = useState<Algorithm>('otsu');
  const [invert, setInvert] = useState(false);

  const { originalUrl, thresholdedUrl, processing, encodedData } = useEncode(
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
