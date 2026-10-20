import type { CatalogueWork } from '@/entities/book/types';
import { BookLine } from '@/entities/book/ui/BookLine';

// One book the catalogue found, to pick
export function SearchResult({
  work,
  onPick,
}: {
  work: CatalogueWork;
  onPick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onPick}
      className='group flex w-full cursor-pointer items-center gap-4 rounded-2xl p-2.5 text-left transition-colors duration-500 ease-soft hover:bg-surface/80 sm:p-3'
    >
      <BookLine
        title={work.title}
        byline={work.authors.slice(0, 2).join(', ') || 'Unknown author'}
        coverUrl={work.coverUrl}
        details={[
          work.firstPublishYear,
          work.editionCount > 1 && `${work.editionCount} editions`,
        ]}
      />
      <span className='hidden text-sm text-muted opacity-0 transition-opacity duration-500 ease-soft group-hover:opacity-100 sm:block'>
        Choose
      </span>
    </button>
  );
}
