import { useState } from 'react';
import type { Algorithm } from '../../../../global/types';
import Setting from '../encodeTab/Settings';
import Results from '../../../shared/Results';
import Actions from '../../../shared/Actions';
import EncodedData from '../encodeTab/EncodedData';
import useEncode from '../../../../hooks/useEncode';
import { type Colors } from '../../../../global/types';

export default function EncodeTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [algorithm, setAlgorithm] = useState<Algorithm>('otsu');
  const [invert, setInvert] = useState(false);
  const [colors, setColors] = useState<Colors>({
    aboveThresholdColor: '#ffffff',
    belowThresholdColor: '#000000',
  });

  const { originalUrl, thresholdedUrl, processing, encodedData } = useEncode(
    selectedFile,
    threshold,
    algorithm,
    invert,
    colors
  );

  return (
    <>
      <Setting
        threshold={threshold}
        selectedFile={selectedFile}
        processing={processing}
        algorithm={algorithm}
        colors={colors}
        setSelectedFile={setSelectedFile}
        setThreshold={setThreshold}
        setAlgorithm={setAlgorithm}
        setInvert={setInvert}
        invert={invert}
        setColors={setColors}
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
