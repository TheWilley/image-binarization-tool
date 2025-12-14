export default function ImageCard({
  title,
  nullText,
  url,
  processing,
  altText,
}: {
  title: string;
  nullText: string;
  url: string | null;
  processing?: boolean;
  altText: string;
}) {
  return (
    <div className='card border border-base-300 p-4 rounded-lg bg-[#0a0a0a]'>
      <h3 className='card-title text-xl font-semibold mb-3'>{title}</h3>
      <div className='min-h-72 flex items-center justify-center rounded-lg overflow-hidde relative'>
        {url && (
          <img
            src={url}
            alt={altText}
            className={`
              w-full h-full object-contain max-h-[60vh]
              transition duration-500 ease-in
            `}
          />
        )}
        <div className='absolute text-center'>
          {processing ? (
            <span className='text-primary p-8'>
              <div className='loading loading-infinity loading-xl scale-200 bg-purple-900' />
            </span>
          ) : (
            !url && <div className='text-neutral-focus p-8'>{nullText}</div>
          )}
        </div>
      </div>
    </div>
  );
}
