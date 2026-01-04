import { type ReactNode } from 'react';
import InfoIcon from '../../icons/InfoIcon';

export default function ActionCollapse({
  label,
  data,
  tooltip,
  actionButtons,
}: {
  label: string;
  data: string;
  tooltip: string;
  actionButtons: {
    icon: ReactNode;
    text: string;
    action: () => void;
  }[];
}) {
  return (
    <div
      tabIndex={0}
      className='collapse collapse-arrow bg-[#0a0a0a] border rounded-lg border-base-300 w-full mb-2'
    >
      <div className='collapse-title font-semibold'>{label}</div>
      <div className='collapse-content text-sm'>
        <div className='flex justify-between items-center'>
          {actionButtons.map((button) => (
            <button className='btn' onClick={button.action}>
              {button.icon}
              {button.text}
            </button>
          ))}

          <div className='tooltip tooltip-left cursor-pointer p-1' data-tip={tooltip}>
            <InfoIcon />
          </div>
        </div>

        <textarea
          className='textarea w-full font-mono bg-black/20'
          value={data}
          readOnly
        />
      </div>
    </div>
  );
}
