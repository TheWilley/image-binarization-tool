import { useState } from 'react';
import { isValidHttpUrl } from '../../../utils/isValidHttpUrl';
import { ALGORITHM_REFERENCES } from '../../../data/algorithm_references';
import { type Algorithm } from '../../../global/types';

function ThresholdAlgorithmDisplay(props: { references: string[] }) {
  const [keepReferencesOpen, setKeepReferencesOpen] = useState(false);
  const newLineWord = '[NewLine]';

  return (
    <div className='collapse collapse-plus bg-base-100 border border-accent mt-2'>
      <input
        type='checkbox'
        checked={keepReferencesOpen}
        onClick={(e) => setKeepReferencesOpen(e.currentTarget.checked)}
      />
      <div className='collapse-title font-semibold'>References</div>
      <div className='collapse-content'>
        <ul className='p-1 list-disc ml-3'>
          {props.references.map((reference) => (
            <li className={reference === newLineWord ? 'list-none ' : ''}>
              {isValidHttpUrl(reference) ? (
                <a href={reference} className='link' target='_blank'>
                  {reference}
                </a>
              ) : (
                <p> {reference === newLineWord ? <>&nbsp;</> : reference} </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ThresholdAlgorithm({ algorithm }: { algorithm: Algorithm }) {
  const references = ALGORITHM_REFERENCES[algorithm];

  if (!references || algorithm === 'manual') return null;

  return <ThresholdAlgorithmDisplay references={references} />;
}
