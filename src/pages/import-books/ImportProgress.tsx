import { counted } from '@/shared/lib/plural';

// How far an import's got: the books into the library (`done` of `of`),
// then those wanted into Want to read; a bar filling as it goes, and what
// to expect meanwhile
export function ImportProgress({
  wanted,
  done,
  of,
}: {
  wanted: boolean;
  done: number;
  of: number;
}) {
  return (
    <div className='flex flex-col gap-4'>
      <p className='text-ink'>
        {wanted
          ? `Putting the books you want to read in Want to read, ${done.toLocaleString('en')} of ${of.toLocaleString('en')}…`
          : `Bringing over ${done.toLocaleString('en')} of ${counted(of, 'book')}…`}
      </p>
      <div className='h-1.5 overflow-hidden rounded-full bg-line/60'>
        <div
          className='h-full rounded-full bg-ink transition-[width] duration-500 ease-soft'
          style={{ width: `${(done / of) * 100}%` }}
        />
      </div>
      <p className='max-w-xl font-serif text-lg leading-relaxed text-ink'>
        This can take a few minutes, please be patient. Each book is looked up
        in Open Library for its cover and details. Keep this page open till it’s
        done.
      </p>
    </div>
  );
}
