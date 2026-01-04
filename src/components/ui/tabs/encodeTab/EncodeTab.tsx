import { useState } from 'react';
import Setting from '../encodeTab/Settings';
import Results from '../../../shared/Results';
import Actions from '../../../shared/Actions';
import BottomDrawers from '../encodeTab/EncodedData';
import useEncode from '../../../../hooks/useEncode';
import useSettings from '../../../../hooks/useSettings';

export default function EncodeTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    algorithm,
    setAlgorithm,
    colors,
    setColors,
    invert,
    setInvert,
    threshold,
    setThreshold,
  } = useSettings();

  const { originalUrl, thresholdedUrl, processing, encodedData, fileIsLarge } = useEncode(
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
        showLargeFileWarning={fileIsLarge}
      />

      <Results
        algorithm={algorithm}
        originalUrl={originalUrl}
        processing={processing}
        threshold={threshold}
        thresholdedUrl={thresholdedUrl}
      />

      <Actions url={thresholdedUrl} processing={processing} />
      <BottomDrawers encodedData={encodedData} />
    </>
  );
}
