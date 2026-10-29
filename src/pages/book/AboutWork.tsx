import { useWorkDetails } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { Fold } from '@/shared/ui/Fold';
import { SmoothHeight } from '@/shared/ui/SmoothHeight';
import { Spinner } from '@/shared/ui/Spinner';
import { aboutTextClass } from './aboutText';
import { BookSection } from './BookSection';

// What a book not on the reader's shelves is about, as the catalogue tells
// it, asked for at once (nothing of the reader's own to write it in)
export function AboutWork({ book }: { book: Book }) {
  const details = useWorkDetails(book.openLibrary?.work);
  const description = details.data?.description;
  return (
    <BookSection title='What it’s about'>
      <SmoothHeight>
        <div
          key={details.isPending ? 'asking' : 'said'}
          className='animate-fade-in'
        >
          {details.isPending ? (
            <p className='flex items-center gap-3 text-[15px] text-muted'>
              <Spinner />
              Asking Open Library…
            </p>
          ) : description ? (
            <Fold className={aboutTextClass}>{description}</Fold>
          ) : (
            <p className='text-[15px] text-muted'>
              Open Library doesn’t describe this one.
            </p>
          )}
        </div>
      </SmoothHeight>
    </BookSection>
  );
}
