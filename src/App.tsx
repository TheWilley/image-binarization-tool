import Footer from './components/ui/base/Footer';
import Wrapper from './components/ui/base/Wrapper';
import Tabs from './components/shared/Tabs';
import Header from './components/ui/base/Header';
import DecodeTab from './components/ui/tabs/DecodeTab';
import EncodeTab from './components/ui/tabs/EncodeTab';
import { useSearchParams } from 'react-router-dom';

export default function App() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') === 'decode' ? 'decode' : 'encode';

  return (
    <Wrapper>
      <Header title='Image Binarization Tool' />
      <Tabs
        tabs={[
          { label: 'Encode', key: 'encode' },
          { label: 'Decode', key: 'decode' },
        ]}
        defaultTab={defaultTab}
        children={{
          encode: <EncodeTab />,
          decode: <DecodeTab />,
        }}
      />
      <Footer />
    </Wrapper>
  );
}
