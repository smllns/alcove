import { PlacesEditor } from '@/features/places';
import { counted } from '@/shared/lib/plural';
import { SectionIntro } from '../SectionIntro';

// No places yet: the ones to name, right here, a home ready to start
// with
export function SetUpPlaces({
  books,
  counts,
}: {
  books: number;
  counts: Record<string, number>;
}) {
  return (
    <div className='flex flex-col items-center'>
      {books ? (
        <SectionIntro eyebrow='Places' title='Put your books on their shelves'>
          {counted(books, 'book')} without a place yet. Start with where you
          keep them: a home, then its rooms, bookcases and shelves, as far as
          you like.
        </SectionIntro>
      ) : (
        <SectionIntro eyebrow='Places' title='Where do your books live?'>
          Name the places you keep them: a home, its rooms, bookcases and
          shelves. Then add your books, each straight onto its shelf.
        </SectionIntro>
      )}
      <div
        className='mt-10 w-full max-w-xl animate-rise sm:mt-12'
        style={{ animationDelay: '180ms' }}
      >
        <PlacesEditor
          homes={[]}
          counts={counts}
          startBlank
          submitLabel='Save places'
        />
      </div>
    </div>
  );
}
