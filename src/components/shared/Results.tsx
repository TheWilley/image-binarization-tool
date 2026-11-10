import type { ReactNode } from 'react';
import useDelayedFlag from '../../hooks/useDelayedFlag';
import ImageAreaIcon from '../../icons/ImageAreaIcon';

/**
 * Card that shows a result and handles the loading state around it.
 *
 * - `ready`: there is something to show, so `children` are rendered.
 *   They stay mounted while processing, with a delayed overlay on top,
 *   so a re-process never flickers.
 * - not `ready` and `processing`: a skeleton placeholder (first load).
 * - not `ready` and not `processing`: an empty-state icon.
 */
export default function Results({
  title,
  processing,
  ready,
  emptyLabel = 'No result yet',
  children,
}: {
  title: string;
  processing: boolean;
  ready: boolean;
  /** Accessible description of the empty-state icon */
  emptyLabel?: string;
  children: ReactNode;
}) {
  // Only show the overlay if processing takes a noticeable time, and keep it up long enough to be seen
  const showOverlay = useDelayedFlag(processing);

  return (
    <div className='w-full card border bg-[#0a0a0a] border-base-300 p-4 rounded-lg mb-4'>
      <h3 className='card-title text-xl font-semibold mb-3'>{title}</h3>
      <div className='text-center'>
        {ready ? (
          // The previous result stays visible under the overlay until the new one arrives
          <div className='relative' aria-busy={processing}>
            {children}
            <div
              className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
                showOverlay ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={!showOverlay}
            >
              <span className='loading loading-ring loading-xl text-white' />
            </div>
          </div>
        ) : processing ? (
          // First load: nothing to show yet, so use a placeholder
          <div
            className='skeleton aspect-16/9 w-full'
            aria-busy='true'
            aria-label='Processing image'
          />
        ) : (
          <div role='img' aria-label={emptyLabel} className='flex justify-center'>
            <ImageAreaIcon className='w-full max-w-48 opacity-30' />
          </div>
        )}
      </div>
    </div>
  );
}
