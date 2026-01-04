import { useState } from 'react';
import CopyIcon from '../../../../icons/CopyIcon';
import ActionCollapse from '../../../shared/ActionCollapse';

export default function EncodedData({ encodedData }: { encodedData: string }) {
  const [copied, setCopied] = useState('Copy');

  const handleCopy = () => {
    navigator.clipboard.writeText(encodedData).then(() => {
      setCopied('Copied!');
      setTimeout(() => setCopied('Copy'), 2000);
    });
  };

  return (
    <div className='flex flex-col gap-2'>
      <ActionCollapse
        label='Show Encoded Data'
        data={encodedData}
        tooltip='This is the RLE encoded binary data of the thresholded image.'
        actionButtons={[{ text: copied, action: handleCopy, icon: <CopyIcon /> }]}
      />
    </div>
  );
}
