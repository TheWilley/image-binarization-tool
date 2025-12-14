import type { PropsWithChildren } from 'react';

export default function Wrapper({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center p-6 font-['Inter']">
      <div className='max-w-5xl w-full'>{children}</div>
    </div>
  );
}
