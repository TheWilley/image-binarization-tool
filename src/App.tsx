import Actions from './components/Actions';
import Footer from './components/Footer';
import Header from './components/Header';
import Results from './components/Results';
import Setting from './components/Settings';
import useImageThreshold from './hooks/useThreshold';
import Wrapper from './components/Wrapper';
import { useState } from 'react';
import type { Algorithm } from './hooks/useThreshold';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(128);
  const [algorithm, setAlgorithm] = useState<Algorithm>('otsu');
  const [invert, setInvert] = useState(false);

  const { originalUrl, thresholdedUrl, processing } = useImageThreshold(
    selectedFile,
    threshold,
    algorithm,
    invert
  );

  return (
    <Wrapper>
      <Header title='Image Binarization Tool' />
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
      <Footer />
    </Wrapper>
  );
}
