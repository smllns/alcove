import { useBooksByWriter } from '@/entities/book/queries';
import { BookLine } from '@/entities/book/ui/BookLine';
import { cn } from '@/shared/lib/cn';
import { monthName } from '@/shared/lib/dates';
import { counted } from '@/shared/lib/plural';
import { noticeClass } from '@/shared/ui/surfaces';

// As many shown by name; the rest only counted
const SHOWN = 3;

// Before adding a book: what the reader has by the same writer already,
// so it's plain where it'll join them (and in the sky, which
// constellation). Nothing when there's nothing of theirs yet.
export function ShelvedByWriter({ writer }: { writer: string | undefined }) {
  const theirs = useBooksByWriter(writer).data ?? [];
  if (!theirs.length) return null;
  const rest = theirs.length - SHOWN;
  return (
    <div className={cn(noticeClass, 'mb-8 animate-fade-in')}>
      <p className='text-sm text-ink'>
        Already on your shelves by {writer}: {counted(theirs.length, 'book')}
      </p>
      <ul className='mt-3 flex flex-col gap-2.5'>
        {theirs.slice(0, SHOWN).map((book) => (
          <li key={book.id}>
            {/* Whose it is, the notice says; when it came, each one */}
            <BookLine
              title={book.title}
              byline=''
              details={[`Added ${monthName(new Date(book.createdAt))}`]}
              coverUrl={book.cover?.url}
              size='sm'
            />
          </li>
        ))}
      </ul>
      {rest > 0 && <p className='mt-2 text-xs text-muted'>and {rest} more</p>}
    </div>
  );
}
