import type { countBrought, Source } from '@/features/import-books';
import { counted } from '@/shared/lib/plural';
import { Button } from '@/shared/ui/Button';
import { Choices } from '@/shared/ui/Choices';
import { labelClass } from '@/shared/ui/fieldStyles';

type Counts = ReturnType<typeof countBrought>;

// One line of what's to come over: how many, and what that is
function Line({
  count,
  title,
  note,
}: {
  count: number;
  title: string;
  note: string;
}) {
  return (
    <li className='flex items-baseline gap-4 border-b border-line/70 py-4'>
      <span className='w-14 shrink-0 font-serif text-3xl leading-none text-ink'>
        {count.toLocaleString('en')}
      </span>
      <span>
        <span className='block text-ink'>{title}</span>
        <span className='mt-0.5 block text-sm text-muted'>{note}</span>
      </span>
    </li>
  );
}

// What the file holds, before anything's brought over: how many paper
// editions go on the shelves, as if the reader had each, how many come as
// e-books and audiobooks, in the library but not on the shelves, and how
// many go into Want to read, unless they're left out; then the way on, or
// back to another file
export function ImportPreview({
  source,
  counts,
  wanted,
  onWanted,
  onBring,
  onBack,
}: {
  source: Source;
  counts: Counts;
  wanted: boolean;
  onWanted: (wanted: boolean) => void;
  onBring: () => void;
  onBack: () => void;
}) {
  const coming = counts.shelved + counts.screen + (wanted ? counts.wanted : 0);
  return (
    <div className='flex flex-col gap-8'>
      <div>
        <p className={labelClass}>From {source}</p>
        <ul className='mt-2'>
          <Line
            count={counts.shelved}
            title='On your shelves'
            note='Paper editions, as if each stood on your shelves. Take off what you don’t have, or put the books in their places in your home, any time.'
          />
          <Line
            count={counts.screen}
            title='E-books and audiobooks'
            note='In your library as read on a screen or listened to, not on your shelves.'
          />
          {counts.wanted > 0 && (
            <Line
              count={counts.wanted}
              title='Want to read'
              note='Into your Want to read list, as books you don’t have yet.'
            />
          )}
        </ul>
      </div>
      {counts.wanted > 0 && (
        <Choices
          label={`The ${counted(counts.wanted, 'book')} you want to read`}
          options={[
            { value: 'want', label: 'Into Want to read' },
            { value: 'leave', label: 'Leave them out' },
          ]}
          value={wanted ? 'want' : 'leave'}
          onChange={(next) => next && onWanted(next === 'want')}
        />
      )}
      <p className='text-sm leading-relaxed text-muted'>
        Each book is looked up in Open Library by its ISBN, for its cover and
        details. Those it doesn’t know come as the file has them. Books already
        in your library are left as they are.
      </p>
      <div className='flex flex-wrap gap-3'>
        <Button arrow onClick={onBring} disabled={!coming}>
          Bring {counted(coming, 'book')} over
        </Button>
        <Button variant='pill' onClick={onBack}>
          Choose another file
        </Button>
      </div>
    </div>
  );
}
