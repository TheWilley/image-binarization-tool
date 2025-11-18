import ImageCard from './ImageCard';
import type { Algorithm } from '../hooks/useThreshold';

export default function Results({
  originalUrl,
  algorithm,
  threshold,
  thresholdedUrl,
  processing,
}: {
  originalUrl: string | null;
  algorithm: Algorithm;
  threshold: number;
  thresholdedUrl: string | null;
  processing: boolean;
}) {
  return (
    <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
      <ImageCard
        title='Original Image'
        nullText='Upload an image above to begin'
        url={originalUrl}
        processing={processing && !originalUrl}
        altText='Original image uploaded by user'
      />
      <ImageCard
        title={`Thresholded Image (${algorithm})`}
        nullText='Thresholded result will appear here.'
        url={thresholdedUrl}
        processing={processing}
        altText={`Binarized image using ${algorithm} mode and threshold ${threshold}`}
      />
    </div>
  );
}
