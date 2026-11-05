import { ButtonLink } from '@/shared/ui/ButtonLink';
import { Lead } from '@/shared/ui/PageHeading';
import { paths } from '@/shared/config/paths';

// The shelves with nothing on them yet: a bare shelf, and the ways to fill
// it, a first book or a whole library brought over
export function EmptyShelf() {
  return (
    <div
      className='flex animate-rise flex-col items-center text-center'
      style={{ animationDelay: '240ms' }}
    >
      {/* A bare shelf */}
      <div
        aria-hidden
        className='mb-10 h-px w-56 bg-line shadow-[0_6px_14px_-4px_rgba(40,28,14,0.35)]'
      />
      <Lead className='max-w-sm'>
        Your shelves are empty for now. Add the first book you can reach, and
        the rest will follow.
      </Lead>
      {/* One by one, or everything kept on another site at once */}
      <div className='mt-8 flex flex-wrap justify-center gap-3'>
        <ButtonLink to={paths.addBook} arrow>
          Add your first book
        </ButtonLink>
        <ButtonLink to={paths.importBooks} variant='secondary'>
          Import from Goodreads or StoryGraph
        </ButtonLink>
      </div>
    </div>
  );
}
