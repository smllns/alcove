import type { CatalogueWork } from '@/entities/book/types';
import { BookCover } from '@/entities/book/ui/BookCover';

export function SearchResult({
  work,
  onPick,
}: {
  work: CatalogueWork;
  onPick: () => void;
}) {
  const meta = [
    work.firstPublishYear,
    work.editionCount > 1 ? `${work.editionCount} editions` : null,
  ].filter(Boolean);

  return (
    <button
      type='button'
      onClick={onPick}
      className='group flex w-full cursor-pointer items-center gap-4 rounded-2xl p-2.5 text-left transition-colors duration-500 ease-soft hover:bg-surface/80 sm:gap-5 sm:p-3'
    >
      <BookCover
        title={work.title}
        author={work.authors[0]}
        url={work.coverUrl}
        size='S'
        className='w-11 shrink-0 shadow-[0_8px_14px_-8px_rgba(40,28,14,0.5)] sm:w-12'
      />
      <span className='min-w-0 flex-1'>
        <span className='block truncate font-serif text-lg leading-tight tracking-[-0.01em]'>
          {work.title}
        </span>
        <span className='mt-1 block truncate text-sm text-muted'>
          {work.authors.slice(0, 2).join(', ') || 'Unknown author'}
        </span>
        {meta.length > 0 && (
          <span className='mt-0.5 block text-xs text-faint'>
            {meta.join(' · ')}
          </span>
        )}
      </span>
      <span className='hidden text-sm text-muted opacity-0 transition-opacity duration-500 ease-soft group-hover:opacity-100 sm:block'>
        Choose
      </span>
    </button>
  );
}
