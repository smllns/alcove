import { useEditCopy } from '@/entities/book/queries';
import { useWorkRatings } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { ReadersRating } from '@/entities/book/ui/ReadersRating';
import { Collapse } from '@/shared/ui/Collapse';
import { FormError } from '@/shared/ui/FormError';
import { StarRating } from '@/shared/ui/StarRating';

// The reader's own stars, large and to be changed with a click right here
// (for a book of theirs: one with a copy), and beside them (under them, on
// a phone) how readers at large rate the book: the catalogue's readers, or
// else the average the reader gave it themselves. That comes later than
// the page, so it opens out softly.
export function BookRatings({ book }: { book: Book }) {
  const { save, pending, error } = useEditCopy(book);
  const catalogue = useWorkRatings(book.openLibrary?.work).data;
  const average =
    catalogue ??
    (book.averageRating ? { average: book.averageRating } : undefined);

  return (
    <div>
      <div className='flex flex-col items-start sm:flex-row sm:gap-x-14'>
        {book.copy && (
          <StarRating
            label='Your rating'
            value={(pending ?? book.copy).rating ?? 0}
            onChange={(rating) => save({ rating: rating || undefined })}
          />
        )}
        <Collapse open={Boolean(average)} arriving>
          <div className='pt-6 sm:pt-0'>
            {average && <ReadersRating label='Average rating' {...average} />}
          </div>
        </Collapse>
      </div>
      <FormError message={error} small className='mt-3' />
    </div>
  );
}
