import Actions from './components/Actions';
import Footer from './components/Footer';
import Results from './components/Results';
import Setting from './components/Settings';
import useImageThreshold from './hooks/useThreshold';
import Wrapper from './components/Wrapper';
import Tabs from './components/Tabs';
import { useState } from 'react';
import type { Algorithm } from './hooks/useThreshold';
import EncodedData from './components/ui/EncodedData';
import Header from './components/Header';
import Decode from './components/ui/Decode';

export default function App() {
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
    <Wrapper>
      <Header title='Image Binarization Tool' />
      <Tabs
        tabs={[
          { label: 'Encode', key: 'encode' },
          { label: 'Decode', key: 'decode' },
        ]}
        children={{
          encode: (
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
          ),
          decode: <Decode />,
        }}
      />
      <Footer />
    </Wrapper>
  );
}
