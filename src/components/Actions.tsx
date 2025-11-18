export default function Actions({
  url,
  processing,
}: {
  url: string | null;
  processing: boolean;
}) {
  const openImage = () => {
    if (url) {
      window.open(url, '_blank')?.focus();
    }
  };

  const saveImage = () => {
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = 'binarization_image.png';
      link.click();
    }
  };

  return (
    <div className='card bg-base-100 w-full shadow-md mb-10'>
      <div className='card-body p-0 grid grid-cols-1 md:grid-cols-2 gap-3'>
        <button className='btn' onClick={saveImage} disabled={processing || !url}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3'
            />
          </svg>
          Save Image
        </button>
        <button className='btn' onClick={openImage} disabled={processing || !url}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='size-5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'
            />
          </svg>
          Open Image
        </button>
      </div>
    </div>
  );
}
