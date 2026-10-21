import { useWorkRatings } from '@/entities/book/catalogueQueries';
import { ReadersRating } from '@/entities/book/ui/ReadersRating';
import { TextField } from '@/shared/ui/TextField';
import type { DraftForm } from './BookForm';

// How readers at large rate the book. From the catalogue when its readers
// have rated it, as it stands (it's asked afresh each time it's shown);
// otherwise the reader may give the average themselves, from wherever
// they look it up.
export function AverageRatingField({
  form,
  workKey,
}: {
  form: DraftForm;
  // The book in the catalogue, if it's there
  workKey?: string;
}) {
  const catalogue = useWorkRatings(workKey);
  // Not until the catalogue has answered, so a field doesn't flash up
  // only to be replaced
  if (catalogue.isLoading) return null;
  if (catalogue.data)
    return (
      <ReadersRating
        label='Average rating'
        average={catalogue.data.average}
        count={catalogue.data.count}
      />
    );
  return (
    <div className='grid gap-6 sm:grid-cols-2'>
      <TextField
        label='Average rating'
        inputMode='decimal'
        placeholder='4.2'
        hint={
          workKey
            ? 'Open Library has no ratings for it. Out of 5, from Goodreads, say.'
            : 'How readers rate it, out of 5. From Goodreads, say.'
        }
        {...form.field('averageRating')}
      />
    </div>
  );
}
