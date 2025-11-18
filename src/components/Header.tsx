export default function Header({ title }: { title: string }) {
  return (
    <header className='text-center mb-10 w-full'>
      <h1 className='text-4xl sm:text-5xl font-extrabold mb-2 tracking-tight'>{title}</h1>
    </header>
  );
}
