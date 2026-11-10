export default function ImageDiff({
  originalUrl,
  thresholdedUrl,
}: {
  originalUrl: string;
  thresholdedUrl: string;
}) {
  return (
    <div className='diff aspect-16/9' tabIndex={0}>
      <div className='diff-item-1 border-white' role='img' tabIndex={0}>
        <img alt='Original Image' src={originalUrl} />
      </div>
      <div
        className='diff-item-2 after:bg-white after:border-2 after:border-base-100/70'
        role='img'
      >
        <img alt='Thresholded Image' src={thresholdedUrl} />
      </div>
      <div className='diff-resizer'></div>
    </div>
  );
}
