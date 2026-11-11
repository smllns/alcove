import { lifespan } from '@/entities/book/authors';
import type { CatalogueAuthor } from '@/entities/book/types';
import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/Spinner';
import { Portrait } from '@/shared/ui/Portrait';

// Who a writer was, beside their page as a book's cover is beside its: their
// photo (Portrait), their name, as the reader's books have it, their
// years and how many of their books the reader has. A spinner after the years
// while they're on their way; every line keeps its place all along, so nothing
// moves.
export function AuthorHeading({
  name,
  author,
  waiting,
  shelved,
}: {
  name: string;
  author: CatalogueAuthor | null;
  waiting: boolean;
  // "3 books on your shelves · 2 read", once known
  shelved?: string;
}) {
  const years = lifespan(author);
  return (
    <div className='flex animate-rise flex-col items-center text-center lg:items-stretch lg:text-left'>
      <Portrait
        // Its fade begun afresh for another picture
        key={author?.photoUrl}
        name={name}
        url={author?.photoUrl}
        className='w-44 sm:w-52 lg:w-full'
      />
      <h1 className='mt-6 font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-balance lg:text-[2.6rem]'>
        {name}
      </h1>
      <p className='mt-2 flex min-h-7 items-center gap-2.5 font-serif text-lg text-ink-soft tabular-nums'>
        <span
          className={cn(
            'transition-opacity duration-500 ease-soft',
            years ? 'opacity-100' : 'opacity-0',
          )}
        >
          {years}
        </span>
        <span
          className={cn(
            'inline-flex text-faint transition-opacity duration-500 ease-soft',
            waiting ? 'opacity-100' : 'opacity-0',
          )}
        >
          <Spinner />
        </span>
      </p>
      <p
        className={cn(
          'mt-1 min-h-5 text-sm text-ink-soft transition-opacity duration-500 ease-soft',
          shelved ? 'opacity-100' : 'opacity-0',
        )}
      >
        {shelved}
      </p>
    </div>
  );
}
