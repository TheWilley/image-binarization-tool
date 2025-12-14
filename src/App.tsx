import Footer from './components/ui/base/Footer';
import Wrapper from './components/ui/base/Wrapper';
import Tabs from './components/shared/Tabs';
import Header from './components/ui/base/Header';
import DecodeTab from './components/ui/tabs/DecodeTab';
import EncodeTab from './components/ui/tabs/EncodeTab';

export default function App() {
  return (
    <Wrapper>
      <Header title='Image Binarization Tool' />
      <Tabs
        tabs={[
          { label: 'Encode', key: 'encode' },
          { label: 'Decode', key: 'decode' },
        ]}
        children={{
          encode: <EncodeTab />,
          decode: <DecodeTab />,
        }}
      />
      <Footer />
    </Wrapper>
  );
}
