import { useEditCopy } from '@/entities/book/queries';
import { useWorkRatings } from '@/entities/book/catalogueQueries';
import type { Book } from '@/entities/book/types';
import { ReadersRating } from '@/entities/book/ui/ReadersRating';
import { FormError } from '@/shared/ui/FormError';
import { StarRating } from '@/shared/ui/StarRating';

// The reader's own stars, large and to be changed with a click right here,
// and beside them how readers at large rate the book: the catalogue's
// readers, or else the average the reader gave it themselves
export function BookRatings({ book }: { book: Book }) {
  const { save, pending, error } = useEditCopy(book);
  const catalogue = useWorkRatings(book.openLibrary?.work).data;
  const average =
    catalogue ??
    (book.averageRating ? { average: book.averageRating } : undefined);

  return (
    <div>
      <div className='flex flex-wrap items-start gap-x-14 gap-y-6'>
        <StarRating
          label='Your rating'
          value={(pending ?? book.copy)?.rating ?? 0}
          onChange={(rating) => save({ rating: rating || undefined })}
        />
        {average && <ReadersRating label='Average rating' {...average} />}
      </div>
      <FormError message={error} small className='mt-3' />
    </div>
  );
}
