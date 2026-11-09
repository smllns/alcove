import { paths } from '@/shared/config/paths';
import { TransitionLink } from '@/shared/ui/TransitionLink';
import { BookSection } from '../BookSection';
import { SourceCredit } from '../SourceCredit';
import { Sticky } from '../Sticky';
import type { KeptNote } from './keptNotes';

// What the reader kept from a writer's books (keptNotes), as sticky notes
// as on a book's page, each saying which book it's from and leading to it;
// words of the writer's own credited to Wikiquote (`source`)
export function AuthorNotes({
  notes,
  source,
}: {
  notes: KeptNote[];
  source?: string | null;
}) {
  const credited = notes.some((note) => !note.book);
  return (
    <BookSection title='Your notes and quotes'>
      {/* A grid, not columns: a note lifting as it's pointed at would be
          cut off at a column's top edge */}
      <ul className='grid items-start gap-x-6 gap-y-8 pt-3 sm:grid-cols-2 xl:grid-cols-3'>
        {notes.map((note, i) => (
          <li key={`${note.book?.id ?? 'wikiquote'}:${note.text}`}>
            <Sticky nth={i}>
              <p className='line-clamp-8 whitespace-pre-line font-serif text-base leading-[28px]'>
                {note.quote ? `“${note.text}”` : note.text}
              </p>
              <p className='mt-1 text-xs leading-[28px] opacity-65'>
                {note.book ? (
                  <TransitionLink
                    to={paths.book(note.book.id)}
                    className='hover:underline hover:underline-offset-2'
                  >
                    {note.book.title}
                  </TransitionLink>
                ) : (
                  'Wikiquote'
                )}
                {note.book && (note.quote ? ' · your quote' : ' · your note')}
              </p>
            </Sticky>
          </li>
        ))}
      </ul>
      {credited && source && (
        <SourceCredit source='Wikiquote' href={source} className='mt-6' />
      )}
    </BookSection>
  );
}
